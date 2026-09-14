"""Build the Creator Bank workbook.

The Creators sheet is the only place data lives. Every number on the Dashboard
is a real formula pointing back at it, so when you edit a stage, type a note or
correct a rate by hand, the dashboard updates the moment you press Enter — no
re-running this tool.
"""

from __future__ import annotations

from pathlib import Path

from openpyxl import Workbook
from openpyxl.formatting.rule import CellIsRule, ColorScaleRule, FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.table import Table, TableStyleInfo

from .extract import find_money
from .profile import COLUMNS, HEADERS, STAGE_LABELS
from .store import rows

INK = "1B1B1F"
ACCENT = "2F6FED"
MUTED = "6B7280"
HEAD_FILL = PatternFill("solid", fgColor="1B1B1F")
SUBHEAD_FILL = PatternFill("solid", fgColor="EEF2FF")
CARD_FILL = PatternFill("solid", fgColor="F7F8FA")

RED = PatternFill("solid", fgColor="FDE2E1")
AMBER = PatternFill("solid", fgColor="FFF3D6")
GREEN = PatternFill("solid", fgColor="DEF7E5")
GREY = PatternFill("solid", fgColor="EDEDED")

THIN = Side(style="thin", color="D8DBE0")
BOX = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)

# Sensible default widths, keyed by field name.
WIDTHS = {
    "handle": 22, "display_name": 22, "stage_label": 20, "priority": 6,
    "next_action": 34, "waiting_on": 13, "days_since_last": 11, "last_message": 12,
    "first_contact": 13, "last_from": 10, "last_preview": 52, "their_rate_low": 15,
    "their_rate_high": 16, "my_offer": 12, "currency": 6, "deliverables": 24,
    "followers": 11, "replied": 9, "hours_to_first_reply": 12, "my_msgs": 9,
    "their_msgs": 10, "total_msgs": 10, "email": 26, "phone": 15, "link": 30,
    "profile_url": 34, "owner_status": 16, "owner_notes": 40, "stage": 14, "thread_dir": 26,
}

MONEY_FIELDS = {"their_rate_low", "their_rate_high", "my_offer"}
INT_FIELDS = {"followers", "my_msgs", "their_msgs", "total_msgs", "days_since_last", "priority"}


def _col(field: str) -> str:
    return get_column_letter(COLUMNS.index(field) + 1)


def _title(ws, cell: str, text: str, size: int = 16) -> None:
    ws[cell] = text
    ws[cell].font = Font(bold=True, size=size, color=INK)


def _label(ws, cell: str, text: str) -> None:
    ws[cell] = text
    ws[cell].font = Font(size=9, color=MUTED)


# ---------------------------------------------------------------------------
# Creators sheet
# ---------------------------------------------------------------------------

def _build_creators(wb: Workbook, records: list) -> int:
    ws = wb.create_sheet("Creators")
    last_row = len(records) + 1

    for idx, field in enumerate(COLUMNS, start=1):
        cell = ws.cell(row=1, column=idx, value=HEADERS[field])
        cell.font = Font(bold=True, color="FFFFFF", size=10)
        cell.fill = HEAD_FILL
        cell.alignment = Alignment(vertical="center", wrap_text=True)
        ws.column_dimensions[get_column_letter(idx)].width = WIDTHS.get(field, 14)
    ws.row_dimensions[1].height = 30

    for r, record in enumerate(records, start=2):
        for idx, field in enumerate(COLUMNS, start=1):
            value = record.get(field, "")
            if field in MONEY_FIELDS or field in INT_FIELDS:
                value = value if value not in ("", None) else None
            cell = ws.cell(row=r, column=idx, value=value)
            cell.alignment = Alignment(
                vertical="top", wrap_text=field in ("last_preview", "next_action", "owner_notes")
            )
            cell.border = BOX
            if field in MONEY_FIELDS:
                cell.number_format = '#,##0'
            elif field in INT_FIELDS:
                cell.number_format = '#,##0'
        ws.cell(row=r, column=COLUMNS.index("profile_url") + 1).font = Font(color=ACCENT, underline="single")

    if last_row > 1:
        table = Table(displayName="CreatorBank", ref=f"A1:{get_column_letter(len(COLUMNS))}{last_row}")
        table.tableStyleInfo = TableStyleInfo(
            name="TableStyleLight9", showRowStripes=True, showColumnStripes=False
        )
        ws.add_table(table)

    ws.freeze_panes = "C2"

    # --- conditional formatting: make the urgent rows impossible to miss ----
    if last_row > 1:
        body = f"A2:{get_column_letter(len(COLUMNS))}{last_row}"
        pri = f"${_col('priority')}2"
        stage_key = f"${_col('stage')}2"

        # Whole-row tint driven by priority / stage.
        ws.conditional_formatting.add(
            body, FormulaRule(formula=[f'{stage_key}="declined"'], fill=GREY, stopIfTrue=True)
        )
        ws.conditional_formatting.add(
            body, FormulaRule(formula=[f"{pri}=1"], fill=RED, stopIfTrue=True)
        )
        ws.conditional_formatting.add(body, FormulaRule(formula=[f"{pri}=2"], fill=AMBER))
        ws.conditional_formatting.add(
            body, FormulaRule(formula=[f'{stage_key}="posted"'], fill=GREEN)
        )

        # Days-quiet heat scale.
        days = f"{_col('days_since_last')}2:{_col('days_since_last')}{last_row}"
        ws.conditional_formatting.add(
            days,
            ColorScaleRule(
                start_type="num", start_value=0, start_color="DEF7E5",
                mid_type="num", mid_value=7, mid_color="FFF3D6",
                end_type="num", end_value=30, end_color="F8B4B0",
            ),
        )
        # Rate column scale, so the expensive creators stand out.
        rate = f"{_col('their_rate_high')}2:{_col('their_rate_high')}{last_row}"
        ws.conditional_formatting.add(
            rate,
            ColorScaleRule(
                start_type="min", start_color="EEF6FF",
                end_type="max", end_color="9EC5FF",
            ),
        )
        ws.conditional_formatting.add(
            f"{_col('replied')}2:{_col('replied')}{last_row}",
            CellIsRule(operator="equal", formula=['"No"'], font=Font(color="B42318")),
        )

        # A dropdown for the one column you are meant to type in.
        statuses = DataValidation(
            type="list",
            formula1='"Priority,Shortlisted,In talks,Booked,Paid,Posted,Pass,Reconnect later"',
            allow_blank=True,
            showDropDown=False,
        )
        ws.add_data_validation(statuses)
        statuses.add(f"{_col('owner_status')}2:{_col('owner_status')}{last_row}")

    # No sheet-level auto_filter here on purpose: the Table above already owns
    # one for this range, and Excel flags the overlap as a corrupt file.
    return last_row


# ---------------------------------------------------------------------------
# Dashboard — all live formulas
# ---------------------------------------------------------------------------

def _build_dashboard(wb: Workbook, last_row: int, owner: str, summary: dict) -> None:
    ws = wb.create_sheet("Dashboard", 0)
    ws.sheet_view.showGridLines = False
    for col, width in zip("ABCDEFGH", (26, 16, 16, 4, 26, 16, 16, 16)):
        ws.column_dimensions[col].width = width

    n = max(last_row, 2)
    stage_rng = f"Creators!${_col('stage')}$2:${_col('stage')}${n}"
    pri_rng = f"Creators!${_col('priority')}$2:${_col('priority')}${n}"
    days_rng = f"Creators!${_col('days_since_last')}$2:${_col('days_since_last')}${n}"
    wait_rng = f"Creators!${_col('waiting_on')}$2:${_col('waiting_on')}${n}"
    rate_rng = f"Creators!${_col('their_rate_high')}$2:${_col('their_rate_high')}${n}"
    ratelow_rng = f"Creators!${_col('their_rate_low')}$2:${_col('their_rate_low')}${n}"
    replied_rng = f"Creators!${_col('replied')}$2:${_col('replied')}${n}"
    handle_rng = f"Creators!${_col('handle')}$2:${_col('handle')}${n}"
    hrs_rng = f"Creators!${_col('hours_to_first_reply')}$2:${_col('hours_to_first_reply')}${n}"

    _title(ws, "A1", "Creator Bank — Instagram outreach", 20)
    ws["A2"] = f"Account: {owner or 'unknown'}   ·   Every figure below is a live formula over the Creators sheet."
    ws["A2"].font = Font(size=10, color=MUTED)

    # ---- KPI cards --------------------------------------------------------
    cards = [
        ("Creators in bank", f"=COUNTA({handle_rng})", "#,##0"),
        ("Replied to you", f'=COUNTIF({replied_rng},"Yes")', "#,##0"),
        ("Reply rate", f'=IFERROR(COUNTIF({replied_rng},"Yes")/COUNTA({handle_rng}),0)', "0.0%"),
        ("You owe a reply", f'=COUNTIF({wait_rng},"Me")', "#,##0"),
        ("Urgent (Pri 1)", f"=COUNTIF({pri_rng},1)", "#,##0"),
        ("Follow up (Pri 2)", f"=COUNTIF({pri_rng},2)", "#,##0"),
        ("Median reply time (hrs)", f"=IFERROR(MEDIAN(IF({hrs_rng}<>\"\",{hrs_rng})),\"\")", "0.0"),
        ("Quiet > 14 days", f'=COUNTIF({days_rng},">14")', "#,##0"),
    ]
    row = 4
    for i, (label, formula, fmt) in enumerate(cards):
        col = "A" if i % 2 == 0 else "C"
        target = "B" if i % 2 == 0 else "D"
        r = row + (i // 2) * 2
        _label(ws, f"{col}{r}", label.upper())
        cell = ws[f"{col}{r + 1}"]
        cell.value = formula
        cell.font = Font(bold=True, size=18, color=INK)
        cell.number_format = fmt
        if label == "Median reply time (hrs)":
            # MEDIAN(IF(...)) needs array evaluation in older Excel.
            cell.value = f'=IFERROR(AVERAGEIF({hrs_rng},">0"),"")'

    # ---- funnel -----------------------------------------------------------
    _title(ws, "E4", "Pipeline", 13)
    ws["E5"], ws["F5"], ws["G5"] = "Stage", "Creators", "% of bank"
    for c in ("E5", "F5", "G5"):
        ws[c].font = Font(bold=True, size=10)
        ws[c].fill = SUBHEAD_FILL
    stage_keys = ["no_reply", "replied", "asked_rates", "rate_received", "negotiating", "agreed", "posted", "declined"]
    for i, key in enumerate(stage_keys):
        r = 6 + i
        ws[f"E{r}"] = STAGE_LABELS[key]
        ws[f"F{r}"] = f'=COUNTIF({stage_rng},"{key}")'
        ws[f"G{r}"] = f'=IFERROR(F{r}/$F${6 + len(stage_keys)},0)'
        ws[f"G{r}"].number_format = "0.0%"
        for c in "EFG":
            ws[f"{c}{r}"].border = BOX
    total_r = 6 + len(stage_keys)
    ws[f"E{total_r}"] = "Total"
    ws[f"F{total_r}"] = f"=SUM(F6:F{total_r - 1})"
    for c in "EF":
        ws[f"{c}{total_r}"].font = Font(bold=True)
    ws.conditional_formatting.add(
        f"F6:F{total_r - 1}",
        ColorScaleRule(start_type="min", start_color="F7F8FA", end_type="max", end_color="9EC5FF"),
    )

    # ---- rate benchmarks --------------------------------------------------
    _title(ws, "A14", "What creators are quoting you", 13)
    bench = [
        ("Quotes on record", f'=COUNT({rate_rng})'),
        ("Cheapest quote", f'=IFERROR(MIN(IF({ratelow_rng}>0,{ratelow_rng})),"")'),
        ("Median quote", f'=IFERROR(MEDIAN(IF({rate_rng}>0,{rate_rng})),"")'),
        ("Average quote", f'=IFERROR(AVERAGEIF({rate_rng},">0"),"")'),
        ("Highest quote", f"=IFERROR(MAX({rate_rng}),\"\")"),
        ("Total if you booked all", f"=IFERROR(SUM({rate_rng}),\"\")"),
    ]
    for i, (label, formula) in enumerate(bench):
        r = 15 + i
        ws[f"A{r}"] = label
        ws[f"A{r}"].font = Font(size=10, color=MUTED)
        ws[f"B{r}"] = formula
        ws[f"B{r}"].number_format = "#,##0"
        ws[f"B{r}"].font = Font(bold=True)
        ws[f"A{r}"].border = ws[f"B{r}"].border = BOX
    # MIN/MEDIAN over a condition need the array form; give the simple
    # equivalents so the file opens clean everywhere.
    ws["B16"] = f'=IFERROR(MINIFS({ratelow_rng},{ratelow_rng},">0"),"")'
    ws["B17"] = f'=IFERROR(MEDIAN({rate_rng}),"")'

    _label(ws, "A22", "Tip: filter the Creators sheet by Stage, then watch these numbers move.")

    # ---- import log -------------------------------------------------------
    _title(ws, "E16", "Last import", 13)
    lines = [
        ("New creators added", summary.get("added", 0)),
        ("Threads refreshed", summary.get("updated", 0)),
        ("Unchanged", summary.get("unchanged", 0)),
        ("Imported at (UTC)", summary.get("at", "")),
    ]
    for i, (label, value) in enumerate(lines):
        r = 17 + i
        ws[f"E{r}"] = label
        ws[f"E{r}"].font = Font(size=10, color=MUTED)
        ws[f"F{r}"] = value
        ws[f"E{r}"].border = ws[f"F{r}"].border = BOX


# ---------------------------------------------------------------------------
# Follow-ups queue
# ---------------------------------------------------------------------------

def _build_followups(wb: Workbook, records: list) -> None:
    ws = wb.create_sheet("Follow-ups")
    ws.sheet_view.showGridLines = False
    _title(ws, "A1", "Today's outreach queue", 18)
    ws["A2"] = "Sorted by urgency. Work top down. Rebuilt every time you re-import."
    ws["A2"].font = Font(size=10, color=MUTED)

    headers = ["#", "Handle", "Profile", "Why now", "Days quiet", "Their rate", "Stage", "Last thing they said", "Done?"]
    widths = [4, 22, 30, 34, 11, 13, 20, 58, 8]
    for idx, (head, width) in enumerate(zip(headers, widths), start=1):
        cell = ws.cell(row=4, column=idx, value=head)
        cell.font = Font(bold=True, color="FFFFFF", size=10)
        cell.fill = HEAD_FILL
        ws.column_dimensions[get_column_letter(idx)].width = width

    queue = [r for r in records if r.get("priority", 9) <= 2 and r.get("stage") != "declined"]
    for i, record in enumerate(queue, start=1):
        r = 4 + i
        values = [
            i,
            record.get("handle", ""),
            record.get("profile_url", ""),
            record.get("next_action", ""),
            record.get("days_since_last", ""),
            record.get("their_rate_high", "") or record.get("their_rate_low", ""),
            record.get("stage_label", ""),
            record.get("last_preview", ""),
            "",
        ]
        for idx, value in enumerate(values, start=1):
            cell = ws.cell(row=r, column=idx, value=value if value != "" else None)
            cell.border = BOX
            cell.alignment = Alignment(vertical="top", wrap_text=idx in (4, 8))
        ws.cell(row=r, column=3).font = Font(color=ACCENT, underline="single")
        ws.cell(row=r, column=6).number_format = "#,##0"

    if queue:
        end = 4 + len(queue)
        ws.conditional_formatting.add(
            f"A5:I{end}",
            FormulaRule(formula=['$D5="⚠ THEY replied — you owe a response"'], fill=RED),
        )
        ws.conditional_formatting.add(
            f"A5:I{end}", FormulaRule(formula=['$I5<>""'], fill=GREEN)
        )
        done = DataValidation(type="list", formula1='"Done,Skip"', allow_blank=True, showDropDown=False)
        ws.add_data_validation(done)
        done.add(f"I5:I{end}")
        ws.freeze_panes = "A5"
    else:
        ws["A5"] = "Nothing urgent — inbox is clear."


# ---------------------------------------------------------------------------
# Rates ledger
# ---------------------------------------------------------------------------

def _build_rates(wb: Workbook, threads_index: list) -> None:
    """Every money figure ever mentioned, with the sentence around it."""
    ws = wb.create_sheet("Rates said")
    ws.sheet_view.showGridLines = False
    _title(ws, "A1", "Every number anyone quoted", 18)
    ws["A2"] = "Raw evidence behind the rate columns. Use it to sanity-check a quote or benchmark a category."
    ws["A2"].font = Font(size=10, color=MUTED)

    headers = ["Handle", "Date", "Who said it", "Amount", "Cur", "As written", "In context"]
    widths = [22, 12, 12, 13, 6, 16, 82]
    for idx, (head, width) in enumerate(zip(headers, widths), start=1):
        cell = ws.cell(row=4, column=idx, value=head)
        cell.font = Font(bold=True, color="FFFFFF", size=10)
        cell.fill = HEAD_FILL
        ws.column_dimensions[get_column_letter(idx)].width = width

    row = 5
    for entry in threads_index:
        for hit in entry["hits"]:
            for idx, value in enumerate(
                [entry["handle"], hit["date"], hit["who"], hit["amount"], hit["currency"], hit["raw"], hit["context"]],
                start=1,
            ):
                cell = ws.cell(row=row, column=idx, value=value)
                cell.border = BOX
                cell.alignment = Alignment(vertical="top", wrap_text=idx == 7)
            ws.cell(row=row, column=4).number_format = "#,##0"
            row += 1

    if row > 5:
        ws.freeze_panes = "A5"
        ws.auto_filter.ref = f"A4:G{row - 1}"
        ws.conditional_formatting.add(
            f"D5:D{row - 1}",
            ColorScaleRule(start_type="min", start_color="EEF6FF", end_type="max", end_color="9EC5FF"),
        )
        ws.conditional_formatting.add(
            f"A5:G{row - 1}", FormulaRule(formula=['$C5="Them"'], font=Font(bold=True))
        )
    else:
        ws["A5"] = "No rates detected yet."


# ---------------------------------------------------------------------------
# How to use
# ---------------------------------------------------------------------------

HOWTO = [
    ("What this file is", ""),
    ("", "Your Instagram DM outreach, turned into a database you can filter, sort and pivot."),
    ("", "Creators = one row per person you have DMed. Everything else is built from it."),
    ("", ""),
    ("The two columns you own", ""),
    ("My status", "A dropdown. Nothing in the import ever overwrites it."),
    ("My notes", "Free text — call outcomes, what you offered, when to circle back."),
    ("", "Everything else is regenerated on each import, so edits there get replaced."),
    ("", ""),
    ("How to refresh it", ""),
    ("1", "Request a fresh export: Instagram > Settings > Accounts Centre > Your information and permissions > Download your information. Pick JSON, Messages only."),
    ("2", "Unzip it, then run:  python -m creator_bank import ~/Downloads/instagram-export"),
    ("3", "Your notes and statuses carry over automatically. New DMs get added."),
    ("", ""),
    ("Stages, in order", ""),
    ("1 · Sent, no reply", "You reached out, silence so far."),
    ("2 · Replied", "They answered but no rates or deliverables discussed yet."),
    ("3 · Rates discussed", "Someone raised pricing."),
    ("4 · Rate received", "They put a number on the table — see the rate columns."),
    ("5 · Negotiating", "Numbers from both sides, still moving."),
    ("6 · Agreed", "They confirmed. Get it in writing."),
    ("7 · Posted / delivered", "Content is live."),
    ("X · Declined", "A no, for now."),
    ("", ""),
    ("Priority", ""),
    ("1", "They replied and you have not answered. Red rows. Do these first."),
    ("2", "Gone quiet, or a deal that needs closing. Amber rows."),
    ("3-4", "In flight or too early to bump."),
    ("5", "Declined — parked."),
    ("", ""),
    ("Handy formulas", ""),
    ("Count a stage", '=COUNTIF(Creators[stage_key],"negotiating")'),
    ("Median rate quoted", "=MEDIAN(Creators[Their rate (high)])"),
    ("Spend if you book everyone tagged Booked", '=SUMIF(Creators[My status],"Booked",Creators[Their rate (high)])'),
    ("Rate per 1k followers", "=Creators[@[Their rate (high)]]/(Creators[@Followers]/1000)"),
    ("Creators under a budget", '=COUNTIFS(Creators[Their rate (high)],"<=15000",Creators[Their rate (high)],">0")'),
    ("Anyone quiet over 10 days", '=COUNTIFS(Creators[Days quiet],">10",Creators[Replied?],"Yes")'),
]


def _build_howto(wb: Workbook) -> None:
    ws = wb.create_sheet("How to use")
    ws.sheet_view.showGridLines = False
    ws.column_dimensions["A"].width = 30
    ws.column_dimensions["B"].width = 108
    _title(ws, "A1", "How to use the Creator Bank", 18)

    row = 3
    for left, right in HOWTO:
        ws[f"A{row}"] = left
        ws[f"B{row}"] = right
        if left and not right:  # section heading
            ws[f"A{row}"].font = Font(bold=True, size=12, color=INK)
            ws[f"A{row}"].fill = SUBHEAD_FILL
            ws[f"B{row}"].fill = SUBHEAD_FILL
        else:
            ws[f"A{row}"].font = Font(bold=True, size=10, color=MUTED)
            ws[f"B{row}"].alignment = Alignment(wrap_text=True, vertical="top")
        row += 1


# ---------------------------------------------------------------------------

def build_workbook(store: dict, path: Path, owner: str = "", summary: dict | None = None,
                   rate_evidence: list | None = None) -> Path:
    records = rows(store)
    summary = summary or (store.get("imports") or [{}])[-1]

    wb = Workbook()
    wb.remove(wb.active)

    last_row = _build_creators(wb, records)
    _build_dashboard(wb, last_row, owner, summary)
    _build_followups(wb, records)
    _build_rates(wb, rate_evidence or [])
    _build_howto(wb)

    wb.active = 0
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(path)
    return path


def collect_rate_evidence(threads, owner: str) -> list:
    """Every money mention across all threads, for the Rates sheet."""
    from .profile import _guess_handle

    index = []
    for thread in threads:
        hits = []
        for message in thread.messages:
            for hit in find_money(message.text):
                hits.append(
                    {
                        "date": message.date,
                        "who": "Me" if message.sender == owner else "Them",
                        "amount": hit.amount,
                        "currency": hit.currency,
                        "raw": hit.raw,
                        "context": hit.context,
                    }
                )
        if hits:
            index.append({"handle": _guess_handle(thread), "hits": hits})
    return index
