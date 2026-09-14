#!/usr/bin/env python3
"""Generate a fake Instagram export so you can try the tool before your real one lands.

It reproduces the real export's quirks: the ``messages/inbox/<slug>/message_1.json``
layout, newest-message-first ordering, and Meta's latin-1 mojibake encoding.

    python3 make_sample.py && python3 -m creator_bank import sample_export --out bank_demo
"""

import hashlib
import json
import shutil
from datetime import datetime, timedelta, timezone
from pathlib import Path

OWNER = "Zakariya Sayed"
NOW = datetime.now(timezone.utc)
ROOT = Path(__file__).parent / "sample_export"


def ms(days_ago, hours=0):
    return int((NOW - timedelta(days=days_ago, hours=hours)).timestamp() * 1000)


def mojibake(text):
    """Encode the way Meta does: UTF-8 bytes written out as latin-1 characters."""
    return text.encode("utf-8").decode("latin-1")


# (slug, display name, [(sender, days_ago, text), ...])
THREADS = [
    ("aaravmehta_food", "Aarav Mehta", [
        (OWNER, 12, "Hey Aarav! Loved your Bandra cafe series 🔥 We're launching a cold brew line and I think your audience would be perfect. Open to a paid collab?"),
    ]),
    ("priyakapoor.styles", "Priya Kapoor", [
        (OWNER, 9, "Hi Priya! Big fan of your styling reels. We'd love to work with you on our new drop — are you taking brand collabs right now?"),
        ("Priya Kapoor", 8, "Hey! Thank you 😊 Yes I am, what did you have in mind?"),
        (OWNER, 8, "One reel plus two stories. What are your rates?"),
        ("Priya Kapoor", 7, "For a reel + 2 stories my rate is Rs. 35,000. I have 128k followers and my reels average 90k views."),
        (OWNER, 6, "That's a bit above our budget for this round — could you do 25000 for the same deliverables?"),
        ("Priya Kapoor", 5, "I can stretch to 30k if we can lock it for next week. That's the best I can do."),
    ]),
    ("rohan.fitness", "Rohan Desai", [
        (OWNER, 20, "Hey Rohan! We're a sports nutrition brand — keen to send you product and discuss a paid partnership."),
        ("Rohan Desai", 19, "Sounds interesting! Send me the details"),
        (OWNER, 19, "Sent you the deck. Looking at 2 reels over a month."),
        ("Rohan Desai", 18, "My rate card: ₹18,000 per reel, so 36k for two. I also do a story set for 5k extra. Media kit here: https://linktr.ee/rohandesai"),
        (OWNER, 17, "Works for us. Let's do 2 reels at 36000 total."),
        ("Rohan Desai", 16, "Deal! Confirmed. Send the product to my address and share the brief 🙌 You can reach me at rohan.desai.collabs@gmail.com"),
    ]),
    ("themakeupdiary_", "Sneha Iyer", [
        (OWNER, 45, "Hi Sneha! Would love to collaborate on our skincare launch."),
        ("Sneha Iyer", 44, "Hi! Sure, my rate is 22000 for one reel."),
        (OWNER, 43, "Perfect, let's go ahead."),
        ("Sneha Iyer", 30, "Posted! It's live on my profile now, went up this morning ✨ Let me know what you think"),
        (OWNER, 29, "Looks amazing, thank you!"),
    ]),
    ("kabir.travels", "Kabir Singh", [
        (OWNER, 15, "Hey Kabir! We're a travel gear brand looking for creators for a Ladakh campaign."),
        ("Kabir Singh", 14, "Hey, thanks for reaching out but I'm not taking any new collabs this quarter. Not a fit right now."),
    ]),
    ("ananya_reads", "Ananya Rao", [
        (OWNER, 6, "Hi Ananya! Loved your bookshelf tour. We're a stationery brand — would you be open to a barter collab?"),
        ("Ananya Rao", 2, "Hi! I'd be interested. I usually do barter for products over 5000 value, otherwise my charge is 8000 per post. What's the product?"),
    ]),
    ("dev.techreviews", "Dev Sharma", [
        (OWNER, 31, "Hey Dev! Interested in a sponsored review of our new earbuds?"),
        ("Dev Sharma", 30, "Hi! What's the budget? I have 45k followers on IG and 120k on YouTube."),
        (OWNER, 30, "What are you charging these days?"),
    ]),
    ("meera.homestyle", "Meera Nair", [
        (OWNER, 3, "Hi Meera! We'd love to send you our new candle range for a possible collab 🕯️"),
    ]),
    ("Campaign Group Chat", "Campaign Group Chat", [
        (OWNER, 5, "Hey everyone, sharing the brief here"),
        ("Priya Kapoor", 5, "Got it"),
        ("Rohan Desai", 4, "Same, thanks"),
    ]),
]


def build():
    if ROOT.exists():
        shutil.rmtree(ROOT)
    inbox = ROOT / "messages" / "inbox"
    inbox.mkdir(parents=True)

    for slug, display, entries in THREADS:
        # Stable digest, not hash(): Python randomises hash() per process, which
        # would rename every sample folder on each run and churn the repo.
        suffix = int(hashlib.md5(slug.encode()).hexdigest()[:12], 16) % 10**10
        folder = inbox / f"{slug}_{suffix:010d}"
        folder.mkdir()
        names = []
        for sender, *_ in entries:
            if sender not in names:
                names.append(sender)
        participants = [n for n in names if n != OWNER] or [display]

        messages = [
            {
                "sender_name": mojibake(sender),
                "timestamp_ms": ms(days),
                "content": mojibake(text),
            }
            for sender, days, text in entries
        ]
        messages.sort(key=lambda m: m["timestamp_ms"], reverse=True)  # newest first, as Meta does

        payload = {
            "participants": [{"name": mojibake(n)} for n in participants + [OWNER]],
            "messages": messages,
            "title": mojibake(display),
            "thread_path": f"inbox/{folder.name}",
        }
        (folder / "message_1.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8"
        )

    print(f"Sample export written to {ROOT}")
    print(f"  {len(THREADS)} threads (1 group chat, which the importer skips by default)")
    print("\nTry it:\n  python3 -m creator_bank import sample_export --out bank_demo")


if __name__ == "__main__":
    build()
