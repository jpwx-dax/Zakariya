"""Pull structured deal signals out of free-text DM conversations.

Everything here is deliberately conservative: it is better to leave a field
blank than to write a wrong number into a negotiation tracker. Anything the
extractor is unsure about still lands in the Rates or Messages sheet, where a
human can eyeball it.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

# --------------------------------------------------------------------------
# Money
# --------------------------------------------------------------------------

# Multipliers for shorthand amounts: "5k", "1.2 lakh", "2L".
_MULTIPLIERS = {
    "k": 1_000,
    "K": 1_000,
    "l": 100_000,
    "lakh": 100_000,
    "lakhs": 100_000,
    "lac": 100_000,
    "lacs": 100_000,
    "m": 1_000_000,
    "mn": 1_000_000,
    "cr": 10_000_000,
    "crore": 10_000_000,
}

_CURRENCY_SYMBOLS = {
    "₹": "INR",
    "rs": "INR",
    "rs.": "INR",
    "inr": "INR",
    "$": "USD",
    "usd": "USD",
    "€": "EUR",
    "eur": "EUR",
    "£": "GBP",
    "gbp": "GBP",
    "aed": "AED",
}

# Symbol/code first:  ₹5,000   Rs. 12k   $500   INR 1.5 lakh
_MONEY_PREFIXED = re.compile(
    r"(?P<cur>₹|\$|€|£|(?<![a-z])(?:rs\.?|inr|usd|eur|gbp|aed)(?![a-z]))"
    r"\s*(?P<num>\d[\d,]*(?:\.\d+)?)"
    r"\s*(?P<mult>lakhs?|lacs?|crore|cr|mn|[klmKLM])?\b",
    re.IGNORECASE,
)

# Bare shorthand that is unambiguous on its own: 5k, 10K, 1.5 lakh, 2L
_MONEY_SHORTHAND = re.compile(
    r"(?<![\w.])(?P<num>\d[\d,]*(?:\.\d+)?)\s*(?P<mult>lakhs?|lacs?|crore|cr|[kK]|(?<=\d)[lL])(?![\w])"
)

# A bare number counts as money only when a fee word sits right next to it,
# e.g. "budget is 8000", "charging 15000 per reel".
_MONEY_KEYWORD = re.compile(
    r"(?:\b(?:budget|rate|rates|charge|charges|charging|fee|fees|price|pricing|"
    r"quote|quotation|cost|costs|pay|paying|payment|offer|offering|total|"
    r"can you do|could you do|we can do|i can do|let'?s do|how about|"
    r"stretch to|come down to|lock it (?:at|for)|settle (?:at|for))\b"
    r"|\bper\s+(?:reel|post|story|video|carousel)\b"
    r"|\bfor\s+(?:one|a|the|two|three|\d+)\s+(?:reels?|posts?|stor(?:y|ies)|videos?)\b"
    r"|\b(?:reels?|posts?|stor(?:y|ies)|videos?|carousels?)\s+(?:at|for)\b)",
    re.IGNORECASE,
)

_BARE_NUMBER = re.compile(
    r"(?<![\w.,])(?P<num>\d{1,3}(?:,\d{3})+|\d{3,7})"
    r"(?![,.]?\d)(?!\w)(?!\s*(?:k|l|lakh|lac|cr)\b)",
    re.IGNORECASE,
)

# Words that mean a nearby number is NOT a fee.
_NOT_MONEY_NEARBY = re.compile(
    r"\b(followers?|follower|subs|subscribers?|views?|likes?|reach|impressions?|"
    r"engagement|audience|people|users?|days?|hours?|am|pm|"
    r"years?|months?|percent|off|discount)\b",
    re.IGNORECASE,
)


@dataclass
class MoneyHit:
    amount: float
    currency: str
    raw: str
    context: str


def _to_amount(num: str, mult: str | None) -> float:
    value = float(num.replace(",", ""))
    if mult:
        value *= _MULTIPLIERS.get(mult.lower(), _MULTIPLIERS.get(mult, 1))
    return value


def _context(text: str, start: int, end: int, width: int = 45) -> str:
    snippet = text[max(0, start - width) : min(len(text), end + width)]
    return " ".join(snippet.split())


def find_money(text: str, default_currency: str = "INR") -> list:
    """Extract plausible fee amounts from one message."""
    if not text:
        return []

    hits: list = []
    claimed: list = []  # character spans already consumed, to avoid double counting

    for match in _MONEY_PREFIXED.finditer(text):
        raw_cur = match.group("cur").lower().rstrip(".")
        currency = _CURRENCY_SYMBOLS.get(raw_cur, _CURRENCY_SYMBOLS.get(raw_cur + ".", default_currency))
        amount = _to_amount(match.group("num"), match.group("mult"))
        hits.append(
            MoneyHit(amount, currency, match.group(0).strip(), _context(text, *match.span()))
        )
        claimed.append(match.span())

    for match in _MONEY_SHORTHAND.finditer(text):
        span = match.span()
        if any(span[0] >= c[0] and span[1] <= c[1] for c in claimed):
            continue
        window = _context(text, *span, width=28)
        if _NOT_MONEY_NEARBY.search(window):
            continue  # "10k followers" is an audience size, not a rate
        amount = _to_amount(match.group("num"), match.group("mult"))
        if amount < 500:
            continue  # too small to be a real collab fee; likely a typo or a count
        hits.append(
            MoneyHit(amount, default_currency, match.group(0).strip(), _context(text, *span))
        )

    # Bare numbers, only when a fee word is close enough to disambiguate them.
    for match in _BARE_NUMBER.finditer(text):
        span = match.span()
        if any(span[0] >= c[0] and span[1] <= c[1] for c in claimed):
            continue
        if any(span[0] >= h_span[0] and span[1] <= h_span[1] for h_span in claimed):
            continue
        before = text[max(0, span[0] - 24) : span[0]]
        after = text[span[1] : span[1] + 16]
        if not (_MONEY_KEYWORD.search(before) or _MONEY_KEYWORD.search(after)):
            continue
        if _NOT_MONEY_NEARBY.search(_context(text, *span, width=24)):
            continue
        amount = float(match.group("num").replace(",", ""))
        if not 500 <= amount <= 5_000_000:
            continue
        if any(abs(h.amount - amount) < 0.01 for h in hits):
            continue  # already captured with an explicit currency
        hits.append(
            MoneyHit(amount, default_currency, match.group(0), _context(text, *span))
        )

    # Drop implausible outliers — a "fee" over 5 crore is a parse artefact.
    return [h for h in hits if 100 <= h.amount <= 50_000_000]


# --------------------------------------------------------------------------
# Deliverables, audience size, contacts
# --------------------------------------------------------------------------

DELIVERABLE_PATTERNS = {
    "reel": r"\breels?\b",
    "story": r"\bstor(?:y|ies)\b|\bstory\s*set\b",
    "post": r"\b(?:static\s+)?posts?\b|\bfeed\s+post\b",
    "carousel": r"\bcarousels?\b",
    "ugc": r"\bugc\b|\buser\s+generated\b",
    "collab": r"\bcollab(?:oration)?\b|\bcollab\s*post\b",
    "barter": r"\bbarter\b|\bexchange\s+for\s+product\b|\bin\s+exchange\s+for\b",
    "giveaway": r"\bgive\s*away\b",
    "youtube": r"\byoutube\b|\byt\b|\bshorts?\b",
    "livestream": r"\blive\s*stream\b|\bgoing\s+live\b",
}

_FOLLOWERS = re.compile(
    r"(?P<num>\d[\d,]*(?:\.\d+)?)\s*(?P<mult>[kKmM]|lakhs?|lacs?)?\s*"
    r"(?:\+\s*)?(?:followers?|subs|subscribers?|audience)",
    re.IGNORECASE,
)

_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]{2,}")
_PHONE = re.compile(r"(?<!\d)(?:\+?\d{1,3}[\s-]?)?[6-9]\d{9}(?!\d)")
_URL = re.compile(r"https?://[^\s<>\"')]+|(?:www\.|linktr\.ee/|beacons\.ai/)[^\s<>\"')]+", re.IGNORECASE)

_MEDIA_KIT_HINT = re.compile(r"media\s*kit|linktr\.ee|beacons\.ai|rate\s*card|portfolio|drive\.google", re.IGNORECASE)


def find_deliverables(text: str) -> set:
    found = set()
    for name, pattern in DELIVERABLE_PATTERNS.items():
        if re.search(pattern, text, re.IGNORECASE):
            found.add(name)
    return found


def find_followers(text: str) -> int | None:
    """Largest audience figure mentioned, normalised to a plain integer."""
    best = None
    for match in _FOLLOWERS.finditer(text):
        value = float(match.group("num").replace(",", ""))
        mult = (match.group("mult") or "").lower()
        if mult in ("k",):
            value *= 1_000
        elif mult in ("m",):
            value *= 1_000_000
        elif mult.startswith(("lakh", "lac")):
            value *= 100_000
        if 500 <= value <= 500_000_000:
            best = max(best or 0, int(value))
    return best


def find_contacts(text: str) -> dict:
    emails = _EMAIL.findall(text)
    phones = _PHONE.findall(text)
    links = [u for u in _URL.findall(text) if _MEDIA_KIT_HINT.search(u)]
    return {
        "email": emails[0] if emails else "",
        "phone": phones[0] if phones else "",
        "link": links[0] if links else "",
    }


# --------------------------------------------------------------------------
# Intent signals
# --------------------------------------------------------------------------

SIGNALS = {
    "agreed": re.compile(
        r"\b(?:deal|confirmed|confirm|sounds good|works for me|let'?s do it|i'?m in|"
        r"count me in|sign(?:ing)? the|send (?:me )?the (?:product|brief|contract|details)|"
        r"share the (?:brief|contract|address)|shipped|invoice|agreed)\b",
        re.IGNORECASE,
    ),
    "declined": re.compile(
        r"\b(?:not interested|no thanks|no thank you|not a fit|not the right fit|"
        r"can'?t do|cannot do|won'?t be able|pass(?:ing)? on this|"
        r"not taking (?:any )?(?:new )?collabs?|fully booked|too low|budget (?:is )?too)\b",
        re.IGNORECASE,
    ),
    "asked_rates": re.compile(
        r"\b(?:rate card|your rates?|what (?:are|do) (?:you|your) charge|"
        r"how much (?:do )?you charge|share (?:your )?(?:rates?|rate card|pricing)|"
        r"pricing|quotation|quote)\b",
        re.IGNORECASE,
    ),
    "negotiating": re.compile(
        r"\b(?:negotiat|budget|best (?:i|we) can (?:do|offer)|can you do|"
        r"final(?:ise|ize)?|counter|discount|revise|revisit|flexible|"
        r"stretch|come down|meet (?:in the )?middle)\b",
        re.IGNORECASE,
    ),
    "posted": re.compile(
        r"\b(?:posted|it'?s live|went live|published|uploaded|link to the (?:reel|post|story)|"
        r"here'?s the link|shared the (?:reel|post))\b",
        re.IGNORECASE,
    ),
}


def find_signals(text: str) -> set:
    return {name for name, pattern in SIGNALS.items() if pattern.search(text)}
