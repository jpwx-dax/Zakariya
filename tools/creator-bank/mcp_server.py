#!/usr/bin/env python3
"""MCP server exposing the creator bank to Claude, ChatGPT, or any MCP client.

Speaks MCP over stdio with no third-party dependencies, so it runs wherever
Python 3.9+ does — no pip install, no virtualenv.

Wire it up (Claude Desktop → Settings → Developer → Edit Config):

    {
      "mcpServers": {
        "creator-bank": {
          "command": "python3",
          "args": ["/absolute/path/to/tools/creator-bank/mcp_server.py"],
          "env": {"CREATOR_BANK_DIR": "/absolute/path/to/tools/creator-bank/bank"}
        }
      }
    }

Then ask in plain language: "who owes me a reply?", "what did Priya quote?",
"draft a follow-up to everyone quiet for more than two weeks".
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from creator_bank import store as store_mod
from creator_bank.profile import STAGE_LABELS

BANK_DIR = Path(os.environ.get("CREATOR_BANK_DIR", Path(__file__).parent / "bank"))
STORE_PATH = BANK_DIR / "creators.json"

PROTOCOL_VERSION = "2024-11-05"
SERVER_INFO = {"name": "creator-bank", "version": "1.0.0"}


def _bank() -> dict:
    return store_mod.load(STORE_PATH)


def _slim(record: dict) -> dict:
    """The fields worth spending tokens on."""
    keep = (
        "handle", "display_name", "stage_label", "next_action", "waiting_on",
        "days_since_last", "last_message", "last_preview", "their_rate_low",
        "their_rate_high", "my_offer", "currency", "deliverables", "followers",
        "email", "link", "profile_url", "owner_status", "owner_notes", "total_msgs",
    )
    return {k: record.get(k) for k in keep if record.get(k) not in ("", None)}


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------

def tool_search_creators(query: str = "", stage: str = "", status: str = "",
                         min_rate: float = 0, max_rate: float = 0,
                         quiet_days_min: int = 0, waiting_on: str = "", limit: int = 25) -> dict:
    records = store_mod.rows(_bank())
    query = (query or "").lower().lstrip("@")

    def keep(r):
        if query:
            blob = " ".join(str(r.get(f, "")) for f in
                            ("handle", "display_name", "owner_notes", "owner_status",
                             "deliverables", "last_preview", "email")).lower()
            if query not in blob:
                return False
        if stage and r.get("stage") != stage:
            return False
        if status and (r.get("owner_status") or "").lower() != status.lower():
            return False
        rate = float(r.get("their_rate_high") or 0)
        if min_rate and rate < min_rate:
            return False
        if max_rate and (rate == 0 or rate > max_rate):
            return False
        if quiet_days_min and int(r.get("days_since_last") or 0) < quiet_days_min:
            return False
        if waiting_on and r.get("waiting_on") != waiting_on:
            return False
        return True

    hits = [r for r in records if keep(r)]
    return {"count": len(hits), "showing": min(len(hits), limit),
            "creators": [_slim(r) for r in hits[:limit]]}


def tool_get_creator(handle: str) -> dict:
    handle = (handle or "").lstrip("@").lower()
    for record in _bank()["creators"].values():
        if (record.get("handle") or "").lower() == handle:
            return record
    matches = [r for r in _bank()["creators"].values() if handle in (r.get("handle") or "").lower()]
    if len(matches) == 1:
        return matches[0]
    if matches:
        return {"error": "multiple matches", "handles": [m["handle"] for m in matches[:15]]}
    return {"error": f"no creator matching '{handle}'"}


def tool_list_followups(limit: int = 20, include_reason: bool = True) -> dict:
    records = store_mod.rows(_bank())
    queue = [r for r in records if r.get("priority", 9) <= 2 and r.get("stage") != "declined"]
    out = []
    for record in queue[:limit]:
        item = _slim(record)
        if include_reason:
            item["why_now"] = record.get("next_action")
        out.append(item)
    return {"total_due": len(queue), "queue": out}


def tool_pipeline_stats() -> dict:
    from collections import Counter

    records = list(_bank()["creators"].values())
    if not records:
        return {"error": "bank is empty — run 'python3 -m creator_bank import <export>' first"}
    stages = Counter(r.get("stage") for r in records)
    rates = sorted(float(r["their_rate_high"]) for r in records if r.get("their_rate_high"))
    replied = sum(1 for r in records if r.get("replied") == "Yes")
    return {
        "total_creators": len(records),
        "replied": replied,
        "reply_rate": round(replied / len(records), 3),
        "you_owe_a_reply": sum(1 for r in records if r.get("waiting_on") == "Me"),
        "urgent": sum(1 for r in records if r.get("priority") == 1),
        "pipeline": {STAGE_LABELS[k]: stages.get(k, 0) for k in STAGE_LABELS},
        "rates": {
            "quotes_on_record": len(rates),
            "min": rates[0] if rates else None,
            "median": rates[len(rates) // 2] if rates else None,
            "max": rates[-1] if rates else None,
        } if rates else None,
        "last_import": (_bank().get("imports") or [{}])[-1].get("at"),
    }


def tool_rate_benchmark(deliverable: str = "", min_followers: int = 0, max_followers: int = 0) -> dict:
    records = list(_bank()["creators"].values())
    rows = []
    for r in records:
        rate = float(r.get("their_rate_high") or 0)
        if not rate:
            continue
        if deliverable and deliverable.lower() not in (r.get("deliverables") or "").lower():
            continue
        followers = int(r.get("followers") or 0)
        if min_followers and followers < min_followers:
            continue
        if max_followers and (not followers or followers > max_followers):
            continue
        rows.append({
            "handle": r["handle"], "rate": rate, "followers": followers or None,
            "deliverables": r.get("deliverables"), "stage": r.get("stage_label"),
            "cost_per_1k_followers": round(rate / (followers / 1000), 1) if followers else None,
        })
    rows.sort(key=lambda x: x["rate"])
    values = [r["rate"] for r in rows]
    return {
        "matches": len(rows),
        "min": values[0] if values else None,
        "median": values[len(values) // 2] if values else None,
        "max": values[-1] if values else None,
        "average": round(sum(values) / len(values), 2) if values else None,
        "creators": rows,
    }


def tool_add_note(handle: str, note: str = "", status: str = "") -> dict:
    bank = _bank()
    handle_norm = (handle or "").lstrip("@").lower()
    target = None
    for key, record in bank["creators"].items():
        if (record.get("handle") or "").lower() == handle_norm:
            target = key
            break
    if target is None:
        partial = [k for k, v in bank["creators"].items() if handle_norm in (v.get("handle") or "").lower()]
        if len(partial) == 1:
            target = partial[0]
        elif partial:
            return {"error": "multiple matches",
                    "handles": [bank["creators"][k]["handle"] for k in partial[:15]]}
        else:
            return {"error": f"no creator matching '{handle}'"}

    record = bank["creators"][target]
    if status:
        record["owner_status"] = status
    if note:
        stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        record["owner_notes"] = f"{record.get('owner_notes', '')}\n[{stamp}] {note}".strip()
    store_mod.save(bank, STORE_PATH)
    return {"updated": record["handle"], "owner_status": record.get("owner_status", ""),
            "owner_notes": record.get("owner_notes", "")}


def tool_rebuild_workbook() -> dict:
    from creator_bank.excel import build_workbook

    bank = _bank()
    if not bank["creators"]:
        return {"error": "bank is empty"}
    path = build_workbook(bank, BANK_DIR / "Creator Bank.xlsx")
    store_mod.write_csv(bank, BANK_DIR / "creators.csv")
    return {"workbook": str(path), "creators": len(bank["creators"])}


TOOLS = [
    {
        "name": "search_creators",
        "description": ("Search the Instagram creator bank. Filter by free text (handle, name, "
                        "notes, deliverables), deal stage, your own status, rate range, days "
                        "since last message, or who owes the next message."),
        "handler": tool_search_creators,
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "free text over handle, name, notes, deliverables"},
                "stage": {"type": "string", "enum": list(STAGE_LABELS.keys())},
                "status": {"type": "string", "description": "your own status, e.g. Booked, In talks"},
                "min_rate": {"type": "number"},
                "max_rate": {"type": "number", "description": "only creators quoting at or below this"},
                "quiet_days_min": {"type": "integer", "description": "silent for at least this many days"},
                "waiting_on": {"type": "string", "enum": ["Me", "Them"]},
                "limit": {"type": "integer", "default": 25},
            },
        },
    },
    {
        "name": "get_creator",
        "description": "Full record for one creator: rates, deliverables, stage, contacts, your notes, last message.",
        "handler": tool_get_creator,
        "inputSchema": {
            "type": "object",
            "properties": {"handle": {"type": "string", "description": "Instagram handle, with or without @"}},
            "required": ["handle"],
        },
    },
    {
        "name": "list_followups",
        "description": ("Today's outreach queue, most urgent first: people who replied and are "
                        "waiting on you, then deals gone quiet. Use this to decide who to message."),
        "handler": tool_list_followups,
        "inputSchema": {
            "type": "object",
            "properties": {"limit": {"type": "integer", "default": 20},
                           "include_reason": {"type": "boolean", "default": True}},
        },
    },
    {
        "name": "pipeline_stats",
        "description": "Totals across the bank: reply rate, stage funnel, rate spread, how many owe you a reply.",
        "handler": tool_pipeline_stats,
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "rate_benchmark",
        "description": ("What creators actually quote, optionally narrowed to a deliverable or a "
                        "follower band. Includes cost per 1k followers so you can sanity-check a price."),
        "handler": tool_rate_benchmark,
        "inputSchema": {
            "type": "object",
            "properties": {
                "deliverable": {"type": "string", "description": "reel, story, post, ugc, barter..."},
                "min_followers": {"type": "integer"},
                "max_followers": {"type": "integer"},
            },
        },
    },
    {
        "name": "add_note",
        "description": ("Record what happened with a creator, or set your status (Booked, In talks, "
                        "Pass...). Notes are timestamped and survive every future DM re-import."),
        "handler": tool_add_note,
        "inputSchema": {
            "type": "object",
            "properties": {
                "handle": {"type": "string"},
                "note": {"type": "string", "description": "what happened, in your words"},
                "status": {"type": "string"},
            },
            "required": ["handle"],
        },
    },
    {
        "name": "rebuild_workbook",
        "description": "Regenerate the Excel workbook and CSV from the current bank.",
        "handler": tool_rebuild_workbook,
        "inputSchema": {"type": "object", "properties": {}},
    },
]

HANDLERS = {t["name"]: t["handler"] for t in TOOLS}
TOOL_SPECS = [{k: t[k] for k in ("name", "description", "inputSchema")} for t in TOOLS]


# ---------------------------------------------------------------------------
# JSON-RPC plumbing
# ---------------------------------------------------------------------------

def _result(request_id, payload):
    return {"jsonrpc": "2.0", "id": request_id, "result": payload}


def _error(request_id, code, message):
    return {"jsonrpc": "2.0", "id": request_id, "error": {"code": code, "message": message}}


def handle(message: dict):
    method = message.get("method")
    request_id = message.get("id")

    if method == "initialize":
        return _result(request_id, {
            "protocolVersion": PROTOCOL_VERSION,
            "capabilities": {"tools": {}},
            "serverInfo": SERVER_INFO,
        })

    if method in ("notifications/initialized", "initialized", "notifications/cancelled"):
        return None  # notifications carry no reply

    if method == "ping":
        return _result(request_id, {})

    if method == "tools/list":
        return _result(request_id, {"tools": TOOL_SPECS})

    if method == "tools/call":
        params = message.get("params") or {}
        name = params.get("name")
        handler = HANDLERS.get(name)
        if handler is None:
            return _error(request_id, -32602, f"unknown tool: {name}")
        try:
            payload = handler(**(params.get("arguments") or {}))
        except TypeError as exc:
            return _error(request_id, -32602, f"bad arguments for {name}: {exc}")
        except Exception as exc:  # surface failures to the model, don't kill the server
            payload = {"error": f"{type(exc).__name__}: {exc}"}
        return _result(request_id, {
            "content": [{"type": "text", "text": json.dumps(payload, indent=2, ensure_ascii=False, default=str)}]
        })

    if request_id is None:
        return None
    return _error(request_id, -32601, f"method not found: {method}")


def main() -> int:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            message = json.loads(line)
        except json.JSONDecodeError:
            continue
        response = handle(message)
        if response is not None:
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
