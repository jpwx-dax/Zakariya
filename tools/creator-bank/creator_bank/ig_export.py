"""Read Instagram's 'Download Your Information' export into normalised threads.

Instagram ships DM history as JSON under ``messages/inbox/<thread>/message_N.json``.
Two quirks make the raw files hard to use directly:

1. Text is mojibake. Meta writes UTF-8 bytes but escapes them as latin-1, so
   "don't" arrives as "donâ\\x80\\x99t" and emoji arrive as garbage. Every string
   has to be round-tripped back through latin-1 before it is readable.
2. A long thread is split across ``message_1.json``, ``message_2.json``, ... in
   *reverse* chronological order, newest file first.

This module hides both.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path


def fix_mojibake(value):
    """Undo Meta's latin-1/UTF-8 double encoding.

    Safe to call on already-clean text: if the round trip fails the original
    string is returned unchanged.
    """
    if not isinstance(value, str):
        return value
    try:
        return value.encode("latin-1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return value


def _walk_fix(node):
    """Recursively repair every string in a decoded JSON structure."""
    if isinstance(node, str):
        return fix_mojibake(node)
    if isinstance(node, list):
        return [_walk_fix(item) for item in node]
    if isinstance(node, dict):
        return {fix_mojibake(k): _walk_fix(v) for k, v in node.items()}
    return node


@dataclass
class Message:
    sender: str
    timestamp: datetime
    text: str
    is_unsent: bool = False
    share_link: str = ""
    media_kind: str = ""  # photo | video | audio | share | reaction-only | ""
    reactions: list = field(default_factory=list)

    @property
    def date(self) -> str:
        return self.timestamp.strftime("%Y-%m-%d")


@dataclass
class Thread:
    """One conversation, oldest message first."""

    thread_dir: str
    title: str
    participants: list
    messages: list
    is_group: bool = False

    @property
    def counterparties(self) -> list:
        """Everyone in the thread who is not the account owner."""
        return [p for p in self.participants if p != self.owner]

    owner: str = ""

    @property
    def first_at(self):
        return self.messages[0].timestamp if self.messages else None

    @property
    def last_at(self):
        return self.messages[-1].timestamp if self.messages else None


def _to_dt(ms: int) -> datetime:
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc)


def _classify_media(raw: dict) -> str:
    for key, label in (
        ("photos", "photo"),
        ("videos", "video"),
        ("audio_files", "audio"),
        ("files", "file"),
        ("share", "share"),
    ):
        if raw.get(key):
            return label
    return ""


def load_thread(thread_dir: Path, owner: str = "") -> Thread | None:
    """Load every ``message_*.json`` in one thread folder into a single Thread."""
    parts = sorted(
        thread_dir.glob("message_*.json"),
        key=lambda p: int("".join(c for c in p.stem if c.isdigit()) or 0),
    )
    if not parts:
        return None

    title = ""
    participants: list = []
    raw_messages: list = []

    # Files are newest-first, so read them in reverse to build an ascending log.
    for part in reversed(parts):
        try:
            blob = json.loads(part.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            continue
        blob = _walk_fix(blob)
        title = title or blob.get("title", "")
        for person in blob.get("participants", []):
            name = person.get("name", "")
            if name and name not in participants:
                participants.append(name)
        raw_messages.extend(blob.get("messages", []))

    messages = []
    for raw in raw_messages:
        ts = raw.get("timestamp_ms")
        if ts is None:
            continue
        share = raw.get("share") or {}
        messages.append(
            Message(
                sender=raw.get("sender_name", ""),
                timestamp=_to_dt(ts),
                text=(raw.get("content") or "").strip(),
                is_unsent=bool(raw.get("is_unsent")),
                share_link=(share.get("link") or "").strip(),
                media_kind=_classify_media(raw),
                reactions=[r.get("reaction", "") for r in raw.get("reactions", [])],
            )
        )

    messages.sort(key=lambda m: m.timestamp)
    messages = [m for m in messages if not m.is_unsent]

    return Thread(
        thread_dir=thread_dir.name,
        title=title,
        participants=participants,
        messages=messages,
        is_group=len(participants) > 2,
        owner=owner,
    )


def detect_owner(threads: list) -> str:
    """Infer the account owner: the one name that appears in nearly every thread."""
    from collections import Counter

    tally = Counter()
    for thread in threads:
        for sender in {m.sender for m in thread.messages}:
            tally[sender] += 1
    if not tally:
        return ""
    name, count = tally.most_common(1)[0]
    # Only trust it if that name is in a clear majority of threads.
    return name if count >= max(2, len(threads) * 0.5) else ""


def find_inbox(root: Path) -> Path | None:
    """Locate the inbox folder inside an unzipped export, wherever Meta buried it."""
    root = Path(root)
    if root.name == "inbox" and root.is_dir():
        return root
    candidates = [
        root / "inbox",
        root / "messages" / "inbox",
        root / "your_instagram_activity" / "messages" / "inbox",
    ]
    for candidate in candidates:
        if candidate.is_dir():
            return candidate
    # Fall back to a search — Meta reshuffles the layout between export versions.
    for match in root.rglob("inbox"):
        if match.is_dir() and any(match.iterdir()):
            return match
    return None


def load_export(root: Path, include_groups: bool = False) -> tuple:
    """Load an unzipped export. Returns ``(threads, owner_name)``."""
    inbox = find_inbox(Path(root))
    if inbox is None:
        raise FileNotFoundError(
            f"No 'inbox' folder found under {root}. Point this at the folder you "
            "unzipped from Instagram's 'Download Your Information' export."
        )

    threads = []
    for thread_dir in sorted(p for p in inbox.iterdir() if p.is_dir()):
        thread = load_thread(thread_dir)
        if thread and thread.messages:
            threads.append(thread)

    owner = detect_owner(threads)
    kept = []
    for thread in threads:
        thread.owner = owner
        if thread.is_group and not include_groups:
            continue
        kept.append(thread)
    return kept, owner
