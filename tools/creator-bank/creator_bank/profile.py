"""Turn one DM thread into a single creator record."""

from __future__ import annotations

import re
from datetime import datetime, timezone

from .extract import find_contacts, find_deliverables, find_followers, find_money, find_signals

# Deal stages, weakest to strongest. The ladder only ever moves forward, so a
# thread that reached "agreed" is not demoted because a later message was chit-chat.
STAGE_ORDER = [
    "no_reply",
    "replied",
    "asked_rates",
    "rate_received",
    "negotiating",
    "agreed",
    "posted",
    "declined",
]

STAGE_LABELS = {
    "no_reply": "1 · Sent, no reply",
    "replied": "2 · Replied",
    "asked_rates": "3 · Rates discussed",
    "rate_received": "4 · Rate received",
    "negotiating": "5 · Negotiating",
    "agreed": "6 · Agreed",
    "posted": "7 · Posted / delivered",
    "declined": "X · Declined",
}

_HANDLE = re.compile(r"@([A-Za-z0-9._]{2,30})")


def _stage_rank(stage: str) -> int:
    try:
        return STAGE_ORDER.index(stage)
    except ValueError:
        return 0


def _guess_handle(thread) -> str:
    """Best-effort Instagram handle for the counterparty.

    Meta's export gives a display name plus a folder slug like
    ``creativekaur_8f3kd9``. The slug is the closer thing to a handle, so strip
    the random suffix Meta appends and use that; fall back to the display name.
    """
    slug = thread.thread_dir
    slug = re.sub(r"_[0-9a-z]{8,12}$", "", slug)  # drop Meta's thread hash
    if slug and re.fullmatch(r"[a-z0-9._]+", slug):
        return slug
    name = (thread.counterparties[0] if thread.counterparties else thread.title) or ""
    match = _HANDLE.search(name)
    return match.group(1) if match else slug or name


def build_record(thread, now: datetime | None = None, ghost_days: int = 7) -> dict:
    """Collapse a thread into one row of the creator bank."""
    now = now or datetime.now(timezone.utc)
    owner = thread.owner
    messages = thread.messages
    if not messages:
        return {}

    mine = [m for m in messages if m.sender == owner]
    theirs = [m for m in messages if m.sender != owner]

    their_text = "\n".join(m.text for m in theirs)
    my_text = "\n".join(m.text for m in mine)
    all_text = their_text + "\n" + my_text

    their_money = [h for m in theirs for h in find_money(m.text)]
    my_money = [h for m in mine for h in find_money(m.text)]

    their_signals = set()
    for m in theirs:
        their_signals |= find_signals(m.text)
    my_signals = set()
    for m in mine:
        my_signals |= find_signals(m.text)

    # ---- stage ladder -----------------------------------------------------
    stage = "no_reply"
    if theirs:
        stage = "replied"
    if "asked_rates" in my_signals or "asked_rates" in their_signals:
        stage = max(stage, "asked_rates", key=_stage_rank)
    if their_money:
        stage = max(stage, "rate_received", key=_stage_rank)
    if ("negotiating" in their_signals or "negotiating" in my_signals) and (their_money or my_money):
        stage = max(stage, "negotiating", key=_stage_rank)
    if "agreed" in their_signals:
        stage = max(stage, "agreed", key=_stage_rank)
    if "posted" in their_signals:
        stage = max(stage, "posted", key=_stage_rank)
    # A decline overrides everything below "posted" — a delivered collab that
    # ends in "can't do the next one" is still a delivered collab.
    if "declined" in their_signals and _stage_rank(stage) < _stage_rank("posted"):
        stage = "declined"

    last = messages[-1]
    last_from_me = last.sender == owner
    days_since = (now - last.timestamp).days

    # ---- first reply latency ---------------------------------------------
    hours_to_reply = ""
    if mine and theirs:
        first_mine = mine[0].timestamp
        first_reply = next((m.timestamp for m in theirs if m.timestamp > first_mine), None)
        if first_reply:
            hours_to_reply = round((first_reply - first_mine).total_seconds() / 3600, 1)

    contacts = find_contacts(all_text)
    deliverables = find_deliverables(all_text)

    # ---- what to do next --------------------------------------------------
    if stage == "declined":
        action, priority = "Archive — revisit next quarter", 5
    elif stage == "posted":
        action, priority = "Ask for performance numbers / repeat collab", 4
    elif not last_from_me and days_since >= 1:
        action, priority = "⚠ THEY replied — you owe a response", 1
    elif not last_from_me:
        action, priority = "They just replied — respond today", 1
    elif stage in ("rate_received", "negotiating", "agreed"):
        action, priority = ("Close the deal — confirm scope & fee", 2) if days_since >= 2 else ("In flight — no action yet", 3)
    elif days_since >= ghost_days and stage == "no_reply":
        action, priority = f"Bump #2 — no reply in {days_since}d", 2
    elif days_since >= ghost_days:
        action, priority = f"Follow up — quiet for {days_since}d", 2
    else:
        action, priority = "Waiting — too soon to bump", 4

    their_amounts = [h.amount for h in their_money]
    my_amounts = [h.amount for h in my_money]
    currency = (their_money or my_money)[0].currency if (their_money or my_money) else ""

    return {
        "handle": _guess_handle(thread),
        "display_name": thread.counterparties[0] if thread.counterparties else thread.title,
        "thread_dir": thread.thread_dir,
        "stage": stage,
        "stage_label": STAGE_LABELS[stage],
        "priority": priority,
        "next_action": action,
        "first_contact": messages[0].timestamp.strftime("%Y-%m-%d"),
        "last_message": last.timestamp.strftime("%Y-%m-%d"),
        "days_since_last": days_since,
        "last_from": "Me" if last_from_me else "Them",
        "last_preview": " ".join(last.text.split())[:160] or f"[{last.media_kind or 'media'}]",
        "waiting_on": "Me" if not last_from_me else "Them",
        "my_msgs": len(mine),
        "their_msgs": len(theirs),
        "total_msgs": len(messages),
        "replied": "Yes" if theirs else "No",
        "hours_to_first_reply": hours_to_reply,
        "their_rate_low": min(their_amounts) if their_amounts else "",
        "their_rate_high": max(their_amounts) if their_amounts else "",
        "my_offer": max(my_amounts) if my_amounts else "",
        "currency": currency,
        "deliverables": ", ".join(sorted(deliverables)),
        "followers": find_followers(all_text) or "",
        "email": contacts["email"],
        "phone": contacts["phone"],
        "link": contacts["link"],
        "profile_url": f"https://instagram.com/{_guess_handle(thread)}",
        # Owner-editable columns. Never overwritten by a re-import.
        "owner_status": "",
        "owner_notes": "",
    }


# Columns the importer must not clobber when refreshing from a new export.
OWNER_FIELDS = ("owner_status", "owner_notes")

# Column order used by both the Excel writer and the CSV writer.
COLUMNS = [
    "handle", "display_name", "stage_label", "priority", "next_action", "waiting_on",
    "days_since_last", "last_message", "first_contact", "last_from", "last_preview",
    "their_rate_low", "their_rate_high", "my_offer", "currency", "deliverables",
    "followers", "replied", "hours_to_first_reply", "my_msgs", "their_msgs", "total_msgs",
    "email", "phone", "link", "profile_url", "owner_status", "owner_notes",
    "stage", "thread_dir",
]

HEADERS = {
    "handle": "Handle",
    "display_name": "Name",
    "stage_label": "Stage",
    "priority": "Pri",
    "next_action": "Next action",
    "waiting_on": "Ball in court",
    "days_since_last": "Days quiet",
    "last_message": "Last msg",
    "first_contact": "First contact",
    "last_from": "Last from",
    "last_preview": "Last message",
    "their_rate_low": "Their rate (low)",
    "their_rate_high": "Their rate (high)",
    "my_offer": "My offer",
    "currency": "Cur",
    "deliverables": "Deliverables",
    "followers": "Followers",
    "replied": "Replied?",
    "hours_to_first_reply": "Hrs to reply",
    "my_msgs": "My msgs",
    "their_msgs": "Their msgs",
    "total_msgs": "Total msgs",
    "email": "Email",
    "phone": "Phone",
    "link": "Media kit",
    "profile_url": "Profile",
    "owner_status": "My status",
    "owner_notes": "My notes",
    "stage": "stage_key",
    "thread_dir": "thread_id",
}
