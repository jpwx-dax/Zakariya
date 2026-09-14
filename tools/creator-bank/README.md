# Creator Bank

Turns your Instagram DM history into a searchable, sortable creator database —
an Excel workbook you can work from, plus a queue of who to message today, plus
an MCP server so Claude or ChatGPT can answer questions about it directly.

Built for creator outreach: who did I message, who replied, what did they quote,
who am I ghosting, and what's a fair rate for 50k followers.

---

## First, the honest bit about getting DMs out of Instagram

There is **no way to live-scrape your Instagram DMs**, and you should be
suspicious of any tool that claims otherwise. Meta has no API for personal
account inboxes, and browser automation against instagram.com breaks their terms
and is one of the fastest ways to get an account restricted. For an account that
*is* your business, that is not a risk worth taking.

What actually works, in order of how much I'd recommend it:

### 1. Download Your Information — recommended, and what this tool reads

Free, official, complete, and it covers your whole DM history including the
conversations you've forgotten about. The catch is that it's a manual export
rather than a live feed, so you re-run it when you want fresh data.

In the Instagram app:

> **Settings → Accounts Centre → Your information and permissions →
> Download your information → Download or transfer information →
> select your account → Some of your information → Messages**

Then set:

| Setting | Choose |
|---|---|
| Format | **JSON** (not HTML — the parser needs JSON) |
| Date range | All time, the first time |
| Media quality | Low (you only need the text; this keeps the file small) |

Meta emails you a download link, usually within a few hours — occasionally up to
a day for a large inbox. Unzip it, point this tool at the folder, done.

Do this once a month, or before a planning session. Every import merges into
what's already there, so **your notes and statuses are never overwritten and old
conversations are never lost**, even if a later export covers a shorter window.

### 2. Instagram Messaging API — live, but heavy

If your account is a **Professional/Business** account connected to a Facebook
Page, Meta's Messaging API gives you real webhooks on new DMs. It needs a Meta
developer app, App Review for the `instagram_manage_messages` permission, and a
public HTTPS endpoint to receive webhooks. It's a genuine multi-day setup and
Meta may reject the review. Worth it only if you need same-minute alerting.

The important thing: the *data model here doesn't change*. If you later add the
API, it writes into the same `creators.json` and everything else keeps working.

### 3. Paid inbox tools

ManyChat, Chatfuel, and similar are officially integrated and will automate DMs,
but they're subscription products built around chat automation, and getting your
history *out* of them is its own problem.

---

## Quick start

```bash
cd tools/creator-bank
pip install -r requirements.txt          # only needed for the Excel output

# Try it on fake data first, so you can see the shape of the output:
python3 make_sample.py
python3 -m creator_bank import sample_export --out bank_demo
open "bank_demo/Creator Bank.xlsx"

# Then the real thing:
python3 -m creator_bank import ~/Downloads/instagram-yourname-2026-01-01
open "bank/Creator Bank.xlsx"
```

Point `import` at the folder you unzipped. It finds the `inbox` folder itself,
wherever Meta buried it in that particular export version.

---

## What you get

**`bank/Creator Bank.xlsx`**

| Sheet | What it's for |
|---|---|
| **Dashboard** | Reply rate, stage funnel, rate benchmarks, how many people you owe a reply. Every cell is a live formula over the Creators sheet, so it updates the moment you edit a row. |
| **Creators** | One row per person. A real Excel Table — filter, sort, pivot. Red rows = they replied and you haven't. Amber = gone quiet. Grey = declined. |
| **Follow-ups** | Today's queue, most urgent first, with a Done dropdown. Work top-down. |
| **Rates said** | Every number anyone quoted, with the sentence around it. Sanity-check a price or benchmark a category. |
| **How to use** | The stage ladder, and copy-paste formulas for common questions. |

**`bank/creators.json`** — the actual source of truth. The workbook is generated
*from* this, so it's safe to delete and rebuild the xlsx any time.

**`bank/creators.csv`** — same data, for Google Sheets or anything else.

### What it works out per creator

Stage (sent → replied → rates discussed → rate received → negotiating → agreed →
posted, or declined), who owes the next message, days since last contact, what
they quoted and what you offered, deliverables discussed (reel/story/post/UGC/
barter...), follower count if they mentioned it, email, phone, media-kit link,
reply latency, and a suggested next action.

Two columns are yours and are **never** touched by an import: **My status** (a
dropdown) and **My notes**.

---

## Using it with Claude or ChatGPT

`mcp_server.py` exposes the bank over MCP. It has **no dependencies** beyond the
standard library, so there's nothing to install.

**Claude Desktop** → Settings → Developer → Edit Config:

```json
{
  "mcpServers": {
    "creator-bank": {
      "command": "python3",
      "args": ["/absolute/path/to/tools/creator-bank/mcp_server.py"],
      "env": { "CREATOR_BANK_DIR": "/absolute/path/to/tools/creator-bank/bank" }
    }
  }
}
```

**Claude Code**: `claude mcp add creator-bank -- python3 /absolute/path/to/mcp_server.py`

Restart the client, then just ask:

- *"Who owes me a reply right now?"*
- *"What did Priya quote, and what did I counter with?"*
- *"Anyone in negotiation who's gone quiet more than a week?"*
- *"What's the median rate for a reel from someone under 100k followers?"*
- *"Draft follow-ups for everyone in my queue, matching the tone of my last message to each."*
- *"Note that Rohan confirmed on call and mark him Booked."*

Seven tools are exposed: `search_creators`, `get_creator`, `list_followups`,
`pipeline_stats`, `rate_benchmark`, `add_note`, `rebuild_workbook`.

Because `add_note` writes back to the same store, notes you dictate to Claude
show up in the workbook on the next rebuild.

---

## Commands

```bash
python3 -m creator_bank import <export-folder>   # read an export into the bank
    --min-messages 2        # skip one-line threads
    --ghost-days 10         # days of silence before a bump is due (default 7)
    --include-groups        # group chats too (skipped by default)

python3 -m creator_bank list                     # browse in the terminal
    --stage negotiating --waiting-on-me --quiet-days 14 --json

python3 -m creator_bank stats                    # pipeline summary
python3 -m creator_bank note <handle> "text" --status Booked
python3 -m creator_bank build                    # rebuild xlsx from the store
python3 -m creator_bank pull-edits creators.csv  # pull notes back from an edited CSV
```

All commands take `--out <folder>` if you want to keep more than one bank.

Run the tests with `python3 test_creator_bank.py` — it generates the sample
export itself, so there's nothing to set up first.

`sample_export/` is generated rather than committed: its timestamps are relative
to the day you run `make_sample.py`, which is what makes the stages and
"days quiet" figures meaningful.

---

## Worth knowing

**Handles are inferred from the export.** Meta's export gives a display name plus
a folder slug like `priyakapoor.styles_5424304140`. The tool strips the trailing
hash, which recovers the handle in most cases but not all — if someone changed
their username, the slug reflects when the thread started.

**Rate detection is deliberately cautious.** It reads `₹18,000`, `Rs. 12k`,
`$500`, `1.5 lakh`, and bare numbers next to a fee word ("charging 15000 per
reel", "could you do 25000"). It deliberately ignores `45k followers` and
`25000 views`. It will still miss rates buried in an unusual phrasing, and it
may occasionally pick up a number that isn't a fee — that's why the **Rates
said** sheet shows the surrounding sentence for every figure. Treat the rate
columns as a fast first pass, not gospel.

**Stages only move forward.** A thread that reached "Agreed" doesn't get demoted
because the last message was small talk.

**Group chats are skipped by default** — they're rarely 1:1 outreach.

**Your data stays on your machine.** Nothing is uploaded anywhere. `bank/` and
any unzipped export are gitignored, and they should stay that way: those files
contain the full text of private conversations.
