"""Command line entry point: python -m creator_bank <command>"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from . import store as store_mod
from .excel import build_workbook, collect_rate_evidence
from .ig_export import load_export
from .profile import STAGE_LABELS, build_record

DEFAULT_DIR = Path("bank")
STORE_FILE = "creators.json"
XLSX_FILE = "Creator Bank.xlsx"
CSV_FILE = "creators.csv"


def _paths(out_dir: Path) -> tuple:
    out_dir = Path(out_dir)
    return out_dir / STORE_FILE, out_dir / XLSX_FILE, out_dir / CSV_FILE


def cmd_import(args) -> int:
    export_root = Path(args.export).expanduser()
    if not export_root.exists():
        print(f"error: {export_root} does not exist", file=sys.stderr)
        return 1

    print(f"Reading export from {export_root} ...")
    threads, owner = load_export(export_root, include_groups=args.include_groups)
    if not threads:
        print("No conversations found. Is this the folder you unzipped from Instagram?", file=sys.stderr)
        return 1
    print(f"  {len(threads)} conversations · account detected as {owner or 'unknown'}")

    now = datetime.now(timezone.utc)
    records = []
    for thread in threads:
        if len(thread.messages) < args.min_messages:
            continue
        record = build_record(thread, now=now, ghost_days=args.ghost_days)
        if record:
            records.append(record)
    print(f"  {len(records)} creator threads kept (min {args.min_messages} messages)")

    store_path, xlsx_path, csv_path = _paths(args.out)
    bank = store_mod.load(store_path)
    summary = store_mod.merge(bank, records, source=str(export_root))
    store_mod.save(bank, store_path)

    evidence = collect_rate_evidence(threads, owner)
    build_workbook(bank, xlsx_path, owner=owner, summary=summary, rate_evidence=evidence)
    store_mod.write_csv(bank, csv_path)

    print(
        f"\n  + {summary['added']} new   ~ {summary['updated']} updated   "
        f"= {summary['unchanged']} unchanged   → {summary['total']} in bank"
    )
    if summary["new_handles"]:
        preview = ", ".join(summary["new_handles"][:8])
        more = "" if len(summary["new_handles"]) <= 8 else f" (+{len(summary['new_handles']) - 8} more)"
        print(f"  New: {preview}{more}")
    print(f"\nWrote:\n  {xlsx_path}\n  {csv_path}\n  {store_path}")
    return 0


def cmd_build(args) -> int:
    store_path, xlsx_path, csv_path = _paths(args.out)
    bank = store_mod.load(store_path)
    if not bank["creators"]:
        print("Bank is empty — run 'import' first.", file=sys.stderr)
        return 1
    build_workbook(bank, xlsx_path)
    store_mod.write_csv(bank, csv_path)
    print(f"Rebuilt {xlsx_path} from {len(bank['creators'])} creators")
    return 0


def cmd_list(args) -> int:
    store_path, _, _ = _paths(args.out)
    bank = store_mod.load(store_path)
    records = store_mod.rows(bank)

    if args.stage:
        records = [r for r in records if r.get("stage") == args.stage]
    if args.waiting_on_me:
        records = [r for r in records if r.get("waiting_on") == "Me"]
    if args.quiet_days is not None:
        records = [r for r in records if int(r.get("days_since_last") or 0) >= args.quiet_days]
    records = records[: args.limit]

    if args.json:
        print(json.dumps(records, indent=2, ensure_ascii=False))
        return 0

    if not records:
        print("Nothing matches.")
        return 0
    print(f"{'HANDLE':<24} {'STAGE':<22} {'QUIET':>6}  {'RATE':>9}  NEXT ACTION")
    print("-" * 110)
    for r in records:
        rate = r.get("their_rate_high") or r.get("their_rate_low") or ""
        rate = f"{int(rate):,}" if rate else "—"
        print(
            f"{r.get('handle','')[:23]:<24} {r.get('stage_label','')[:21]:<22} "
            f"{str(r.get('days_since_last','')):>5}d  {rate:>9}  {r.get('next_action','')[:42]}"
        )
    print(f"\n{len(records)} shown")
    return 0


def cmd_note(args) -> int:
    store_path, _, _ = _paths(args.out)
    bank = store_mod.load(store_path)
    matches = [
        (k, v) for k, v in bank["creators"].items()
        if args.handle.lstrip("@").lower() in (v.get("handle") or "").lower()
    ]
    if not matches:
        print(f"No creator matching '{args.handle}'", file=sys.stderr)
        return 1
    if len(matches) > 1:
        print("Multiple matches — be more specific:", file=sys.stderr)
        for _, v in matches[:10]:
            print(f"  {v['handle']}", file=sys.stderr)
        return 1

    key, record = matches[0]
    if args.status:
        record["owner_status"] = args.status
    if args.text:
        stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        existing = record.get("owner_notes", "")
        record["owner_notes"] = f"{existing}\n[{stamp}] {args.text}".strip()
    store_mod.save(bank, store_path)
    print(f"Updated {record['handle']}: status={record.get('owner_status') or '—'}")
    if record.get("owner_notes"):
        print(f"  notes: {record['owner_notes'][-160:]}")
    return 0


def cmd_pull_edits(args) -> int:
    store_path, _, _ = _paths(args.out)
    bank = store_mod.load(store_path)
    edits = store_mod.read_owner_edits(Path(args.csv))
    applied = store_mod.apply_owner_edits(bank, edits)
    store_mod.save(bank, store_path)
    print(f"Applied {applied} edits from {args.csv}")
    return 0


def cmd_stats(args) -> int:
    store_path, _, _ = _paths(args.out)
    bank = store_mod.load(store_path)
    records = list(bank["creators"].values())
    if not records:
        print("Bank is empty.")
        return 0

    from collections import Counter

    stages = Counter(r.get("stage") for r in records)
    replied = sum(1 for r in records if r.get("replied") == "Yes")
    rates = [float(r["their_rate_high"]) for r in records if r.get("their_rate_high")]
    owed = sum(1 for r in records if r.get("waiting_on") == "Me")

    print(f"Creators in bank     {len(records)}")
    print(f"Replied              {replied}  ({replied / len(records):.0%})")
    print(f"You owe a reply      {owed}")
    if rates:
        rates.sort()
        median = rates[len(rates) // 2]
        print(f"Rates on record      {len(rates)}   median {median:,.0f}   range {min(rates):,.0f}–{max(rates):,.0f}")
    print("\nPipeline")
    for key, label in STAGE_LABELS.items():
        print(f"  {label:<26} {stages.get(key, 0)}")
    return 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        prog="creator_bank",
        description="Turn Instagram DM history into a creator outreach database.",
    )
    parser.add_argument("--out", default=str(DEFAULT_DIR), help=f"output folder (default: {DEFAULT_DIR})")

    # Accept --out on either side of the subcommand; argparse.SUPPRESS keeps the
    # subcommand copy from silently overwriting a value given up front.
    shared = argparse.ArgumentParser(add_help=False)
    shared.add_argument("--out", default=argparse.SUPPRESS, help="output folder")

    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("import", parents=[shared], help="read an unzipped Instagram export into the bank")
    p.add_argument("export", help="folder you unzipped from Instagram")
    p.add_argument("--min-messages", type=int, default=1, help="skip threads shorter than this")
    p.add_argument("--ghost-days", type=int, default=7, help="days of silence before a bump is due")
    p.add_argument("--include-groups", action="store_true", help="also import group chats")
    p.set_defaults(func=cmd_import)

    p = sub.add_parser("build", parents=[shared], help="rebuild the workbook from the stored bank")
    p.set_defaults(func=cmd_build)

    p = sub.add_parser("list", parents=[shared], help="show creators in the terminal")
    p.add_argument("--stage", help="filter by stage key, e.g. negotiating")
    p.add_argument("--waiting-on-me", action="store_true", help="only threads where you owe a reply")
    p.add_argument("--quiet-days", type=int, help="only threads quiet for at least N days")
    p.add_argument("--limit", type=int, default=40)
    p.add_argument("--json", action="store_true", help="emit JSON")
    p.set_defaults(func=cmd_list)

    p = sub.add_parser("note", parents=[shared], help="set your own status or append a note")
    p.add_argument("handle")
    p.add_argument("text", nargs="?", default="", help="note to append")
    p.add_argument("--status", help="e.g. Booked, In talks, Pass")
    p.set_defaults(func=cmd_note)

    p = sub.add_parser("pull-edits", parents=[shared], help="read My status / My notes back from a CSV you edited")
    p.add_argument("csv")
    p.set_defaults(func=cmd_pull_edits)

    p = sub.add_parser("stats", parents=[shared], help="quick pipeline summary")
    p.set_defaults(func=cmd_stats)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
