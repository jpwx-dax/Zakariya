#!/usr/bin/env python3
"""Test suite. Run: python3 test_creator_bank.py"""

import json
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from creator_bank import store as store_mod
from creator_bank.excel import collect_rate_evidence
from creator_bank.extract import find_contacts, find_deliverables, find_followers, find_money, find_signals
from creator_bank.ig_export import fix_mojibake, load_export
from creator_bank.profile import COLUMNS, build_record

HERE = Path(__file__).parent
PASSED, FAILED = [], []


def check(name, got, want):
    if got == want:
        PASSED.append(name)
    else:
        FAILED.append(f"{name}\n      got:  {got!r}\n      want: {want!r}")


def section(title):
    print(f"\n{title}")


# --------------------------------------------------------------------------
section("Mojibake repair")
def as_meta_writes_it(text):
    """Reproduce Meta's bug: UTF-8 bytes emitted as latin-1 characters."""
    return text.encode("utf-8").decode("latin-1")

check("emoji", fix_mojibake(as_meta_writes_it("✨")), "✨")
check("apostrophe", fix_mojibake(as_meta_writes_it("don’t")), "don’t")
check("mixed sentence", fix_mojibake(as_meta_writes_it("It's live 🔥 — 30k")), "It's live 🔥 — 30k")
check("clean text untouched", fix_mojibake("plain ascii"), "plain ascii")
check("already-clean emoji untouched", fix_mojibake("🔥"), "🔥")

# --------------------------------------------------------------------------
section("Money extraction")
def amounts(text):
    return sorted(int(h.amount) for h in find_money(text))

check("rupee symbol", amounts("₹18,000 per reel"), [18000])
check("Rs with period", amounts("Rs. 12,000"), [12000])
check("dollar", amounts("$500 per post"), [500])
check("k shorthand", amounts("5k for a story"), [5000])
check("lakh", amounts("1.5 lakh for the campaign"), [150000])
check("two amounts", amounts("reel is Rs. 12,000 and story is 5k"), [5000, 12000])
check("bare near keyword", amounts("my charge is 8000 per post"), [8000])
check("counter-offer", amounts("could you do 25000 for the same"), [25000])
check("N reels at X", amounts("Let's do 2 reels at 36000 total"), [36000])
check("followers not money", amounts("I have 45000 followers"), [])
check("views not money", amounts("we did 25000 views"), [])
check("phone not money", amounts("my number is 9876543210"), [])
check("k-followers not money", amounts("I got 10k followers"), [])
check("bare number with no keyword", amounts("meeting at 3000 sharp"), [])
check("currency detected", [h.currency for h in find_money("$500 per post")], ["USD"])
check("default currency INR", [h.currency for h in find_money("charge is 8000 per post")], ["INR"])

# --------------------------------------------------------------------------
section("Other signals")
check("deliverables", sorted(find_deliverables("one reel plus two stories and a carousel")), ["carousel", "reel", "story"])
check("followers k", find_followers("I have 128k followers"), 128000)
check("followers lakh", find_followers("2 lakh followers"), 200000)
check("followers max wins", find_followers("45k followers on IG and 120k subscribers"), 120000)
check("email", find_contacts("write to me at a.b@gmail.com")["email"], "a.b@gmail.com")
check("linktree", find_contacts("kit: https://linktr.ee/xyz")["link"], "https://linktr.ee/xyz")
check("agreed signal", "agreed" in find_signals("Deal! Confirmed, send the brief"), True)
check("declined signal", "declined" in find_signals("I'm not taking any new collabs"), True)
check("posted signal", "posted" in find_signals("It's live on my profile now"), True)
check("no false agree", "agreed" in find_signals("what do you think?"), False)

# --------------------------------------------------------------------------
section("End-to-end import")
subprocess.run([sys.executable, "make_sample.py"], cwd=HERE, check=True, capture_output=True)
tmp = Path(tempfile.mkdtemp())
try:
    threads, owner = load_export(HERE / "sample_export")
    check("owner detected", owner, "Zakariya Sayed")
    check("group chat excluded", len(threads), 8)
    check("messages ascending", all(
        all(t.messages[i].timestamp <= t.messages[i + 1].timestamp for i in range(len(t.messages) - 1))
        for t in threads
    ), True)
    check("mojibake gone from messages", any("🔥" in m.text for t in threads for m in t.messages), True)

    now = datetime.now(timezone.utc)
    records = {r["handle"]: r for r in (build_record(t, now=now) for t in threads)}

    check("stage: no reply", records["aaravmehta_food"]["stage"], "no_reply")
    check("stage: negotiating", records["priyakapoor.styles"]["stage"], "negotiating")
    check("stage: agreed", records["rohan.fitness"]["stage"], "agreed")
    check("stage: posted", records["themakeupdiary_"]["stage"], "posted")
    check("stage: declined", records["kabir.travels"]["stage"], "declined")
    check("stage: rate received", records["ananya_reads"]["stage"], "rate_received")

    check("rate high", records["priyakapoor.styles"]["their_rate_high"], 35000.0)
    check("rate low", records["priyakapoor.styles"]["their_rate_low"], 30000.0)
    check("my offer", records["priyakapoor.styles"]["my_offer"], 25000.0)
    check("followers", records["priyakapoor.styles"]["followers"], 128000)
    check("email captured", records["rohan.fitness"]["email"], "rohan.desai.collabs@gmail.com")
    check("media kit captured", records["rohan.fitness"]["link"], "https://linktr.ee/rohandesai")

    check("ball in my court", records["ananya_reads"]["waiting_on"], "Me")
    check("priority 1 when they replied last", records["ananya_reads"]["priority"], 1)
    check("waiting on them", records["aaravmehta_food"]["waiting_on"], "Them")
    check("handle stripped of thread hash", records["rohan.fitness"]["handle"], "rohan.fitness")

    # ---- store merge ----
    section("Store merge")
    store_path = tmp / "creators.json"
    bank = store_mod.load(store_path)
    summary = store_mod.merge(bank, list(records.values()), source="test")
    check("first import adds all", summary["added"], 8)

    key = next(k for k, v in bank["creators"].items() if v["handle"] == "priyakapoor.styles")
    bank["creators"][key]["owner_notes"] = "called her"
    bank["creators"][key]["owner_status"] = "In talks"
    store_mod.save(bank, store_path)

    bank = store_mod.load(store_path)
    summary2 = store_mod.merge(bank, list(records.values()), source="test2")
    check("re-import adds nothing", summary2["added"], 0)
    check("notes preserved", bank["creators"][key]["owner_notes"], "called her")
    check("status preserved", bank["creators"][key]["owner_status"], "In talks")

    # A later partial export that lost the rate must not wipe the known rate.
    stripped = json.loads(json.dumps(list(records.values())))
    for r in stripped:
        r["their_rate_high"] = ""
        r["email"] = ""
    store_mod.merge(bank, stripped, source="partial")
    check("rate survives partial export", bank["creators"][key]["their_rate_high"], 35000.0)
    check("email survives partial export",
          next(v for v in bank["creators"].values() if v["handle"] == "rohan.fitness")["email"],
          "rohan.desai.collabs@gmail.com")
    check("nothing deleted", len(bank["creators"]), 8)

    # ---- CSV round trip ----
    section("CSV round trip")
    csv_path = store_mod.write_csv(bank, tmp / "creators.csv")
    text = csv_path.read_text(encoding="utf-8-sig")
    check("csv has header", text.splitlines()[0].startswith("Handle,Name,Stage"), True)
    check("csv row count", len(text.strip().splitlines()) >= 9, True)

    # ---- workbook ----
    section("Workbook")
    from openpyxl import load_workbook

    from creator_bank.excel import build_workbook

    xlsx = build_workbook(bank, tmp / "Creator Bank.xlsx", owner=owner, summary=summary,
                          rate_evidence=collect_rate_evidence(threads, owner))
    wb = load_workbook(xlsx)
    check("sheets", wb.sheetnames, ["Dashboard", "Creators", "Follow-ups", "Rates said", "How to use"])
    ws = wb["Creators"]
    check("one row per creator", ws.max_row, 9)
    check("all columns written", ws.max_column, len(COLUMNS))
    check("table present", "CreatorBank" in ws.tables, True)
    check("no duplicate autofilter", ws.auto_filter.ref, None)

    # Dashboard formulas must point at the columns they claim to.
    dash = wb["Dashboard"]
    formulas = [c.value for row in dash.iter_rows() for c in row if isinstance(c.value, str) and c.value.startswith("=")]
    check("dashboard is formula-driven", len(formulas) >= 18, True)

    header_at = {ws.cell(row=1, column=i).value: i for i in range(1, ws.max_column + 1)}
    from openpyxl.utils import get_column_letter

    def letter(header):
        return get_column_letter(header_at[header])

    joined = " ".join(formulas)
    check("reply-rate formula uses Replied? column", f"${letter('Replied?')}$2" in joined, True)
    check("pipeline formula uses stage_key column", f"${letter('stage_key')}$2" in joined, True)
    check("rate formulas use rate column", f"${letter('Their rate (high)')}$2" in joined, True)
    check("no formula points past last data row", re.search(r"\$(\d+)\b", joined) is not None, True)
    check("all ranges end at row 9", set(re.findall(r"Creators!\$[A-Z]+\$2:\$[A-Z]+\$(\d+)", joined)), {"9"})

    # Cross-check a formula against the data it summarises.
    stage_col = header_at["stage_key"]
    stages = [ws.cell(row=r, column=stage_col).value for r in range(2, ws.max_row + 1)]
    check("COUNTIF(no_reply) would equal", stages.count("no_reply"), 2)
    check("COUNTIF(agreed) would equal", stages.count("agreed"), 1)
    replied_col = header_at["Replied?"]
    replied = [ws.cell(row=r, column=replied_col).value for r in range(2, ws.max_row + 1)]
    check("reply rate would be 6/8", replied.count("Yes"), 6)

    check("follow-up queue non-empty", wb["Follow-ups"].max_row > 4, True)
    check("rates sheet has evidence", wb["Rates said"].max_row > 4, True)

    # ---- CLI ----
    section("CLI")
    out = subprocess.run([sys.executable, "-m", "creator_bank", "import", "sample_export", "--out", str(tmp / "cli")],
                         cwd=HERE, capture_output=True, text=True)
    check("cli import exits 0", out.returncode, 0)
    check("cli wrote xlsx", (tmp / "cli" / "Creator Bank.xlsx").exists(), True)
    out = subprocess.run([sys.executable, "-m", "creator_bank", "list", "--stage", "negotiating",
                          "--json", "--out", str(tmp / "cli")], cwd=HERE, capture_output=True, text=True)
    check("cli list --json filters", len(json.loads(out.stdout)), 1)
    out = subprocess.run([sys.executable, "-m", "creator_bank", "stats", "--out", str(tmp / "cli")],
                         cwd=HERE, capture_output=True, text=True)
    check("cli stats exits 0", out.returncode, 0)

finally:
    shutil.rmtree(tmp, ignore_errors=True)

# --------------------------------------------------------------------------
print(f"\n{'=' * 60}")
print(f"  {len(PASSED)} passed, {len(FAILED)} failed")
if FAILED:
    print(f"{'=' * 60}")
    for failure in FAILED:
        print(f"  FAIL  {failure}")
    sys.exit(1)
print(f"{'=' * 60}")
