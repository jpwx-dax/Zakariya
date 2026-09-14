"""Durable JSON store for the creator bank.

The store is the source of truth, not the Excel file. That matters because:

* Instagram exports are snapshots. A thread you deleted, or one that falls out
  of a partial date-range export, must not silently vanish from the bank.
* You will edit ``My status`` and ``My notes`` by hand. A re-import has to
  leave those alone.
* Rates you negotiated last quarter are worth keeping even after the
  conversation goes cold.

So every import is a *merge*: new threads are added, known threads are
refreshed, owner-owned columns are preserved, and nothing is ever deleted.
"""

from __future__ import annotations

import csv
import json
from datetime import datetime, timezone
from pathlib import Path

from .profile import COLUMNS, HEADERS, OWNER_FIELDS

STORE_VERSION = 1


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def load(path: Path) -> dict:
    path = Path(path)
    if not path.exists():
        return {"version": STORE_VERSION, "updated_at": None, "creators": {}, "imports": []}
    data = json.loads(path.read_text(encoding="utf-8"))
    data.setdefault("creators", {})
    data.setdefault("imports", [])
    return data


def save(store: dict, path: Path) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    store["updated_at"] = _now_iso()
    path.write_text(json.dumps(store, indent=2, ensure_ascii=False), encoding="utf-8")


def merge(store: dict, records: list, source: str = "") -> dict:
    """Fold freshly parsed records into the store. Returns a change summary."""
    creators = store["creators"]
    added, updated, unchanged = [], [], []

    for record in records:
        key = record["thread_dir"] or record["handle"]
        if not key:
            continue
        existing = creators.get(key)

        if existing is None:
            record["added_at"] = _now_iso()
            record["last_seen_in_export"] = _now_iso()
            creators[key] = record
            added.append(record["handle"])
            continue

        # Preserve anything the owner typed by hand.
        preserved = {f: existing.get(f, "") for f in OWNER_FIELDS if existing.get(f)}
        # Preserve the best rate ever seen, even if a newer partial export missed it.
        for field in ("their_rate_low", "their_rate_high", "my_offer"):
            if not record.get(field) and existing.get(field):
                record[field] = existing[field]
        for field in ("email", "phone", "link", "followers"):
            if not record.get(field) and existing.get(field):
                record[field] = existing[field]

        changed = record.get("last_message") != existing.get("last_message") or record.get(
            "total_msgs"
        ) != existing.get("total_msgs")

        record["added_at"] = existing.get("added_at", _now_iso())
        record["last_seen_in_export"] = _now_iso()
        record.update(preserved)
        creators[key] = record
        (updated if changed else unchanged).append(record["handle"])

    summary = {
        "at": _now_iso(),
        "source": source,
        "added": len(added),
        "updated": len(updated),
        "unchanged": len(unchanged),
        "total": len(creators),
        "new_handles": added[:50],
    }
    store["imports"].append(summary)
    return summary


def rows(store: dict, sort: bool = True) -> list:
    """Store records as a list of dicts in stable column order."""
    records = list(store["creators"].values())
    if sort:
        # Most urgent first: priority, then longest-quiet, then most engaged.
        records.sort(
            key=lambda r: (
                r.get("priority", 9),
                -int(r.get("days_since_last") or 0),
                -int(r.get("total_msgs") or 0),
            )
        )
    return records


def write_csv(store: dict, path: Path) -> Path:
    """Plain CSV mirror — handy for Google Sheets or a quick import elsewhere."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.writer(handle)
        writer.writerow([HEADERS[c] for c in COLUMNS])
        for record in rows(store):
            writer.writerow([record.get(c, "") for c in COLUMNS])
    return path


def read_owner_edits(path: Path) -> dict:
    """Read back 'My status' / 'My notes' edits made in a CSV or exported sheet.

    Lets you edit in Sheets/Excel and push the notes back into the store so the
    next import keeps them. Keyed on thread_id, falling back to handle.
    """
    path = Path(path)
    if not path.exists():
        return {}
    edits: dict = {}
    with path.open(newline="", encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            key = (row.get("thread_id") or row.get("Handle") or "").strip()
            if not key:
                continue
            payload = {
                "owner_status": (row.get("My status") or "").strip(),
                "owner_notes": (row.get("My notes") or "").strip(),
            }
            if any(payload.values()):
                edits[key] = payload
    return edits


def apply_owner_edits(store: dict, edits: dict) -> int:
    creators = store["creators"]
    by_handle = {v.get("handle"): k for k, v in creators.items()}
    applied = 0
    for key, payload in edits.items():
        target = key if key in creators else by_handle.get(key)
        if target:
            creators[target].update({k: v for k, v in payload.items() if v})
            applied += 1
    return applied
