"""Eltern-Portal (eltern-portal.org) integration helper for Schulnoten."""
from __future__ import annotations

from datetime import date, datetime, time as dt_time, timedelta
import json
import logging
import re
from typing import Any
from urllib import parse

try:
    from zoneinfo import ZoneInfo
    BERLIN_TZ = ZoneInfo("Europe/Berlin")
except Exception:
    BERLIN_TZ = None

try:
    import aiohttp
    ClientErrorType = aiohttp.ClientError
except ImportError:
    aiohttp = None  # type: ignore
    class ClientErrorType(Exception):  # type: ignore
        pass

try:
    import bs4
except ImportError:
    bs4 = None  # type: ignore

_LOGGER = logging.getLogger(__name__)

try:
    import pyelternportal
    from pyelternportal import ElternPortalAPI
    from pyelternportal.exception import (
        BadCredentialsException,
        CannotConnectException,
        ResolveHostnameException,
        StudentListException,
    )
    HAVE_PYELTERNPORTAL = True
except ImportError:
    pyelternportal = None
    ElternPortalAPI = object  # type: ignore
    BadCredentialsException = Exception
    CannotConnectException = Exception
    ResolveHostnameException = Exception
    StudentListException = Exception
    HAVE_PYELTERNPORTAL = False

from .const import DEFAULT_SUBJECT_ALIASES, DEFAULT_TIMETABLE_SLOTS

_TIME_RE = re.compile(r"(\d{1,2})[.:](\d{2})\s*-\s*(\d{1,2})[.:](\d{2})")
_ENTFALL_RE = re.compile(r"entf[aä]ll|ausfall|f[aä]llt\s+aus|\bfrei\b|unterrichtsfrei", re.I)

WEEKDAY_MAP = {
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
    7: "sunday",
}


def school_from_input(value: str) -> str:
    """Extract school identifier from user input or full Eltern-Portal URL.

    Examples:
        'https://bspgym.eltern-portal.org' -> 'bspgym'
        'https://bspgym.eltern-portal.org/start' -> 'bspgym'
        'bspgym' -> 'bspgym'
        'demo' -> 'demo'
    """
    val = value.strip().lower()
    if "eltern-portal.org" in val:
        if "://" not in val:
            val = f"https://{val}"
        host = parse.urlparse(val).hostname or ""
        return host.split(".")[0]
    # Remove any trailing slashes or path parts
    val = val.split("/")[0].strip()
    return val


def resolve_subject_with_index(
    raw_name: str,
    aliases_dict: dict[str, list[str]] | None = None,
    existing_subjects: list[str] | None = None,
) -> tuple[str, int | None]:
    """Resolve a subject abbreviation or code to a full subject name,
    and return the 0-based index of the matched part if slash-separated.

    Supports:
      - Trailing digit stripping (e.g., 'L1' -> 'Latein', 'E2' -> 'Englisch')
      - Slash-separated alternatives (e.g., 'Eth/K/Ev', 'Mu/Cho', 'Smd/Swd') matched
        against student's existing subjects or explicit YAML aliases.
      - Positional matching of teacher and room when multiple options are separated by slashes.
    """
    if not raw_name:
        return ("", None)
    clean = raw_name.strip()
    if not clean:
        return ("", None)

    existing = [s.strip() for s in (existing_subjects or []) if s.strip()]
    aliases = aliases_dict if aliases_dict is not None else DEFAULT_SUBJECT_ALIASES

    def _resolve_single(code: str) -> str | None:
        c = code.strip()
        if not c:
            return None

        # 1. Try exact code first, then without trailing digits (e.g. L1 -> L, E2 -> E, NuT1 -> NuT)
        candidates = [c]
        no_digits = re.sub(r"\d+$", "", c).strip()
        if no_digits and no_digits.lower() != c.lower():
            candidates.append(no_digits)

        # 2. Try handling delimited or duplicated tokens (e.g. 'Sm Sm', 'Sm (Fb)', 'Sm - Sp')
        if any(sep in c for sep in (" ", "-", "–", "➔", "->", "(", ")", ",")):
            tokens = [w.strip() for w in re.split(r"[\s\-_–➔>(),]+", c) if w.strip()]
            if tokens:
                unique_tokens = list(dict.fromkeys(tokens))
                for tok in unique_tokens:
                    if tok not in candidates:
                        candidates.append(tok)
                    tok_no_digits = re.sub(r"\d+$", "", tok).strip()
                    if tok_no_digits and tok_no_digits not in candidates:
                        candidates.append(tok_no_digits)

        for cand in candidates:
            cand_l = cand.lower()

            # Exact match with existing subject
            for s in existing:
                if cand_l == s.lower():
                    return s

            # Exact match with key in aliases
            for key in aliases.keys():
                if cand_l == key.lower():
                    for s in existing:
                        if key.lower() == s.lower():
                            return s
                    return key

            # Match within alias list
            for key, alias_list in aliases.items():
                if not isinstance(alias_list, list):
                    continue
                for a in alias_list:
                    a_str = str(a).strip()
                    pattern = None
                    if "->" in a_str:
                        pattern = a_str.split("->", 1)[0].strip()
                    elif "➔" in a_str:
                        pattern = a_str.split("➔", 1)[0].strip()

                    if pattern and cand_l == pattern.lower():
                        for s in existing:
                            if s.lower() == key.lower():
                                return s
                        return key
                    elif cand_l == a_str.lower():
                        for s in existing:
                            if s.lower() == key.lower() or any(s.lower() == str(al).strip().lower() for al in alias_list):
                                return s
                        return key

            # Fallback to DEFAULT_SUBJECT_ALIASES for enrolled existing subjects
            # (e.g. Sport when user only customized Religion in aliases YAML)
            if aliases_dict is not None and existing:
                for s in existing:
                    if s in aliases:
                        continue
                    def_aliases = DEFAULT_SUBJECT_ALIASES.get(s, [])
                    if any(cand_l == str(a).strip().lower() for a in def_aliases):
                        return s

            # Prefix match against existing subjects (at least 2 chars)
            if len(cand) >= 2:
                prefix_existing = [s for s in existing if s.lower().startswith(cand_l)]
                if len(prefix_existing) == 1:
                    return prefix_existing[0]

                prefix_aliases = [k for k in aliases.keys() if k.lower().startswith(cand_l)]
                if len(prefix_aliases) == 1:
                    return prefix_aliases[0]

        return None

    # Step 0: If no slashes, resolve single code directly
    if "/" not in clean:
        res = _resolve_single(clean)
        return (res if res else clean, None)

    parts = [p.strip() for p in clean.split("/")]
    if len(parts) <= 1:
        res = _resolve_single(clean)
        return (res if res else clean, None)

    # Step 0b: Check explicit arrow mapping in aliases (e.g. 'Eth/K/Ev -> K', 'Eth/K/Ev -> 1', 'Mu/Cho -> Mu')
    for subj_key, alias_list in aliases.items():
        if not isinstance(alias_list, list):
            continue
        for a in alias_list:
            a_str = str(a).strip()
            pattern = None
            target_part = None
            if "->" in a_str:
                pattern, target_part = [x.strip() for x in a_str.split("->", 1)]
            elif "➔" in a_str:
                pattern, target_part = [x.strip() for x in a_str.split("➔", 1)]
            elif ":" in a_str and not a_str.startswith("http"):
                pattern, target_part = [x.strip() for x in a_str.split(":", 1)]

            if pattern and target_part and pattern.lower() == clean.lower():
                # Direct numeric index (0-based or 1-based)
                if target_part.isdigit():
                    num_i = int(target_part)
                    if 0 <= num_i < len(parts):
                        return (subj_key, num_i)
                    elif 1 <= num_i <= len(parts):
                        return (subj_key, num_i - 1)

                t_clean = re.sub(r"\d+$", "", target_part).strip().lower()
                for p_idx, p in enumerate(parts):
                    p_clean = re.sub(r"\d+$", "", p).strip().lower()
                    if p.lower() == target_part.lower() or (p_clean and t_clean and p_clean == t_clean):
                        return (subj_key, p_idx)

                # Match by resolved single subject
                for p_idx, p in enumerate(parts):
                    if _resolve_single(p) == subj_key:
                        return (subj_key, p_idx)

                return (subj_key, 0)

    # Resolve each part individually
    resolved_parts = []
    for p in parts:
        r = _resolve_single(p)
        resolved_parts.append(r if r else p)

    # Step 1: Check full string first (e.g. if 'Eth/K/Ev' is directly configured as an alias in YAML)
    full_resolved = _resolve_single(clean)
    if full_resolved:
        matched_idx = None
        for idx, p in enumerate(parts):
            rp = resolved_parts[idx]
            if rp.lower() == full_resolved.lower() or ("religion" in rp.lower() and "religion" in full_resolved.lower()):
                matched_idx = idx
                break
            f_aliases = aliases.get(full_resolved, [])
            p_cands = [p, re.sub(r"\d+$", "", p).strip()]
            if any(any(pc.lower() == str(a).strip().lower() for a in f_aliases) for pc in p_cands if pc):
                matched_idx = idx
                break
        return (full_resolved, matched_idx)

    # Step 2: Check which parts match a student's configured aliases for an existing subject
    # (High priority: user explicitly put e.g. 'K' in their child's YAML aliases for 'Religion' or 'Katholisch')
    alias_matches: list[tuple[int, str]] = []
    for idx, p in enumerate(parts):
        p_cands = [p, re.sub(r"\d+$", "", p).strip()]
        for pc in p_cands:
            if not pc:
                continue
            for s in existing:
                s_aliases = aliases.get(s, [])
                resolved_p = _resolve_single(pc)
                is_match = False
                if any(pc.lower() == str(a).strip().lower() for a in s_aliases):
                    is_match = True
                elif resolved_p and (resolved_p.lower() == s.lower() or ("religion" in resolved_p.lower() and "religion" in s.lower())):
                    is_match = True
                if is_match:
                    alias_matches.append((idx, s))
                    break

    seen_idx = set()
    unique_alias_matches = []
    for idx, s in alias_matches:
        if idx not in seen_idx:
            seen_idx.add(idx)
            unique_alias_matches.append((idx, s))

    unique_alias_subjects = list(dict.fromkeys(s for _, s in unique_alias_matches))
    if len(unique_alias_subjects) == 1:
        return (unique_alias_subjects[0], unique_alias_matches[0][0])

    # Step 3: Check which parts match an enrolled existing subject
    existing_matches: list[tuple[int, str]] = []
    for idx, rp in enumerate(resolved_parts):
        for s in existing:
            if rp.lower() == s.lower():
                existing_matches.append((idx, s))
                break
            elif "religion" in rp.lower() and "religion" in s.lower():
                existing_matches.append((idx, s))
                break

    seen_idx = set()
    unique_existing_matches = []
    for idx, s in existing_matches:
        if idx not in seen_idx:
            seen_idx.add(idx)
            unique_existing_matches.append((idx, s))

    unique_existing_subjects = list(dict.fromkeys(s for _, s in unique_existing_matches))
    if len(unique_existing_subjects) == 1:
        return (unique_existing_subjects[0], unique_existing_matches[0][0])

    # Step 4: Check if all parts map to the same subject (e.g. Smd/Swd or Smd/Smd/Smd -> Sport)
    unique_resolved = list(dict.fromkeys(resolved_parts))
    if len(unique_resolved) == 1:
        idx = unique_alias_matches[0][0] if len(unique_alias_matches) == 1 else None
        return (unique_resolved[0], idx)

    # Step 5: If only one resolved part was mapped to a known subject, use it
    known_candidates: list[tuple[int, str]] = []
    for idx, rp in enumerate(resolved_parts):
        if rp not in parts:
            known_candidates.append((idx, rp))
    if len(known_candidates) == 1:
        return (known_candidates[0][1], known_candidates[0][0])

    # Step 6: Fallback to original cleaned name
    return (clean, None)


def resolve_subject_name(
    raw_name: str,
    aliases_dict: dict[str, list[str]] | None = None,
    existing_subjects: list[str] | None = None,
) -> str:
    """Resolve a subject abbreviation or code to a full subject name."""
    res, _ = resolve_subject_with_index(raw_name, aliases_dict, existing_subjects)
    return res


def parse_subject_aliases_yaml(yaml_text: str) -> dict[str, list[str]]:
    """Parse YAML text into subject aliases dictionary.

    Empty input yields an empty dict. Does NOT silently restore defaults
    to prevent resurrecting intentionally deleted aliases. Raises ValueError on syntax error.
    """
    if not yaml_text or not yaml_text.strip():
        return {}
    try:
        import yaml
        data = yaml.safe_load(yaml_text)
        if data is None:
            return {}
        if not isinstance(data, dict):
            raise ValueError("YAML muss ein Mapping/Dictionary von Fächern sein.")
        result: dict[str, list[str]] = {}
        for k, v in data.items():
            subj = str(k).strip()
            if not subj:
                continue
            if isinstance(v, list):
                result[subj] = [str(x).strip() for x in v if str(x).strip()]
            elif isinstance(v, str):
                result[subj] = [x.strip() for x in v.split(",") if x.strip()]
            else:
                result[subj] = []
        return result
    except ValueError:
        raise
    except Exception as err:
        _LOGGER.warning("Failed to parse subject aliases YAML: %s", err)
        raise ValueError(f"YAML-Syntaxfehler: {err}") from err


def dump_subject_aliases_yaml(aliases: dict[str, list[str]]) -> str:
    """Dump subject aliases dictionary into clean YAML text."""
    try:
        import yaml
        return yaml.safe_dump(aliases, allow_unicode=True, sort_keys=False)
    except Exception:
        lines = []
        for k, v in aliases.items():
            lines.append(f"{k}: {list(v)}")
        return "\n".join(lines)


def substitution_kind(entry: dict[str, Any]) -> str:
    """Determine substitution kind: 'entfall', 'raum' or 'vertretung'."""
    info_text = (
        f"{entry.get('substitute', '')} {entry.get('subject', '')} "
        f"{entry.get('room', '')} {entry.get('info', '')}"
    ).lower()
    if _ENTFALL_RE.search(info_text) or (
        str(entry.get("substitute", "")).strip() in ("---", "–", "-") and not entry.get("room")
    ):
        return "entfall"
    info = str(entry.get("info", "")).lower()
    subst = str(entry.get("substitute", "")).strip()
    teacher = str(entry.get("teacher", "")).strip()
    if "raum" in info and (not subst or subst == teacher):
        return "raum"
    return "vertretung"


def parse_timetable(html: str) -> list[dict[str, Any]]:
    """Parse timetable HTML into structured lesson list."""
    out: list[dict[str, Any]] = []
    if not html:
        return out

    if bs4 is not None:
        soup = bs4.BeautifulSoup(html, "html.parser")
        for row in soup.select("#asam_content div.table-responsive table tr"):
            cells = row.find_all("td", recursive=False)
            if len(cells) < 6:
                continue
            head = [t.strip() for t in cells[0].find_all(string=True) if t.strip()]
            if not head:
                continue
            number = head[0].rstrip(".").strip()
            start = end = None
            if m := _TIME_RE.search(" ".join(head)):
                start = f"{int(m[1]):02d}:{m[2]}"
                end = f"{int(m[3]):02d}:{m[4]}"
            for weekday, cell in enumerate(cells[1:6], start=1):
                inner = cell.select_one("span span") or cell
                parts = [t.strip() for t in inner.find_all(string=True) if t.strip()]
                if not parts:
                    continue
                subject = parts[0]
                room = parts[1] if len(parts) > 1 else ""
                if not subject.strip(" /"):
                    continue
                out.append(
                    {
                        "weekday": weekday,
                        "lesson": number,
                        "start": start,
                        "end": end,
                        "subject": subject,
                        "room": room.strip(" /"),
                    }
                )
    else:
        # Fallback regex parser when bs4 is unavailable
        rows = re.findall(r"<tr[^>]*>(.*?)</tr>", html, re.DOTALL | re.IGNORECASE)
        for row in rows:
            tds = re.findall(r"<td[^>]*>(.*?)</td>", row, re.DOTALL | re.IGNORECASE)
            if len(tds) < 6:
                continue
            head_text = re.sub(r"<[^>]+>", " ", tds[0]).strip()
            head_parts = [p.strip() for p in head_text.split() if p.strip()]
            if not head_parts:
                continue
            number = head_parts[0].rstrip(".").strip()
            start = end = None
            if m := _TIME_RE.search(head_text):
                start = f"{int(m[1]):02d}:{m[2]}"
                end = f"{int(m[3]):02d}:{m[4]}"
            for weekday, td in enumerate(tds[1:6], start=1):
                cleaned = re.sub(r"<br\s*/?>", "\n", td, flags=re.IGNORECASE)
                text = re.sub(r"<[^>]+>", "", cleaned).strip()
                lines = [line.strip() for line in text.split("\n") if line.strip()]
                if not lines:
                    continue
                subject = lines[0]
                room = lines[1] if len(lines) > 1 else ""
                if not subject.strip(" /"):
                    continue
                out.append(
                    {
                        "weekday": weekday,
                        "lesson": number,
                        "start": start,
                        "end": end,
                        "subject": subject,
                        "room": room.strip(" /"),
                    }
                )

    out.sort(key=lambda x: (x["weekday"], int(x["lesson"]) if x["lesson"].isdigit() else 99))
    return out


def parse_substitutions(html: str) -> dict[str, Any]:
    """Parse substitutions HTML into structured dictionary."""
    result: dict[str, Any] = {"available": False, "stand": None, "days": []}
    if not html:
        return result

    stand_match = re.search(r"Stand:?\s*([\d.]+\s*[\d:]*)", html)
    if stand_match:
        result["stand"] = stand_match.group(1).strip()

    if bs4 is not None:
        soup = bs4.BeautifulSoup(html, "html.parser")
        center = soup.select_one("#asam_content .main_center")
        if center is None:
            return result
        result["available"] = True
        day: dict[str, Any] | None = None
        for tag in center.find_all(["div", "table"], recursive=False):
            if tag.name == "div" and "list" in (tag.get("class") or []):
                if m := re.search(r"(\d{2})\.(\d{2})\.(\d{4})", tag.get_text()):
                    iso = f"{m[3]}-{m[2]}-{m[1]}"
                    day = next((d for d in result["days"] if d["date"] == iso), None)
                    if day is None:
                        day = {"date": iso, "entries": []}
                        result["days"].append(day)
                continue
            if tag.name != "table" or day is None:
                continue
            for row in tag.select("tr"):
                if "vp_plan_head" in (row.get("class") or []):
                    continue
                cells = row.find_all("td", recursive=False)
                if len(cells) < 5:
                    continue
                lesson = re.sub(r"\.(?=\s*[-–])", "", cells[0].get_text(strip=True)).removesuffix(".")
                teacher = cells[1].get_text(strip=True)
                substitute = cells[2].get_text(strip=True)
                if len(cells) >= 6:
                    pieces = [t.strip() for t in cells[3].stripped_strings if t.strip()]
                    if pieces and len(list(dict.fromkeys(pieces))) == 1:
                        subject = pieces[0]
                    else:
                        subject = cells[3].get_text(" ", strip=True)
                    room = cells[4].get_text(strip=True)
                    info = cells[5].get_text(" ", strip=True)
                else:
                    subject = ""
                    room = cells[3].get_text(strip=True)
                    info = cells[4].get_text(" ", strip=True)
                entry = {
                    "lesson": lesson,
                    "teacher": teacher,
                    "substitute": substitute,
                    "subject": subject,
                    "room": room,
                    "info": info,
                }
                entry["kind"] = substitution_kind(entry)
                day["entries"].append(entry)
    else:
        # Fallback regex parser
        result["available"] = ("#asam_content" in html) or ("main_center" in html)
        date_sections = re.split(r'<div[^>]*class="[^"]*list[^"]*"[^>]*>', html, flags=re.IGNORECASE)
        for section in date_sections[1:]:
            m = re.search(r"(\d{2})\.(\d{2})\.(\d{4})", section)
            if not m:
                continue
            iso = f"{m[3]}-{m[2]}-{m[1]}"
            day_entry: dict[str, Any] = {"date": iso, "entries": []}
            rows = re.findall(r"<tr[^>]*>(.*?)</tr>", section, re.DOTALL | re.IGNORECASE)
            for row in rows:
                if "vp_plan_head" in row.lower():
                    continue
                tds = re.findall(r"<td[^>]*>(.*?)</td>", row, re.DOTALL | re.IGNORECASE)
                if len(tds) < 5:
                    continue
                texts = [re.sub(r"<[^>]+>", "", t).strip() for t in tds]
                lesson = re.sub(r"\.(?=\s*[-–])", "", texts[0]).removesuffix(".")
                teacher = texts[1]
                substitute = texts[2]
                if len(tds) >= 6:
                    raw_subj = texts[3]
                    pieces = [t.strip() for t in re.split(r"[\s\n\r]+", raw_subj) if t.strip()]
                    if pieces and len(list(dict.fromkeys(pieces))) == 1:
                        subject = pieces[0]
                    else:
                        subject = raw_subj
                    room = texts[4]
                    info = texts[5]
                else:
                    subject = ""
                    room = texts[3]
                    info = texts[4]
                e = {
                    "lesson": lesson,
                    "teacher": teacher,
                    "substitute": substitute,
                    "subject": subject,
                    "room": room,
                    "info": info,
                }
                e["kind"] = substitution_kind(e)
                day_entry["entries"].append(e)
            result["days"].append(day_entry)

    return result


DEMO_JSON_APPOINTMENT = """{
    "success": 1,
    "result": [
        {
            "id": "id_1",
            "title": "Schulaufgabe in Englisch",
            "title_short": "SA in Englisch",
            "class": "event-important",
            "start": "1729720800000",
            "end": "1729799200000",
            "bo_end": "0"
        },
        {
            "id": "id_2",
            "title": "Schulaufgabe in Deutsch",
            "title_short": "SA in Deutsch",
            "class": "event-important",
            "start": "1730934000000",
            "end": "1731012400000",
            "bo_end": "0"
        },
        {
            "id": "id_3",
            "title": "Schulaufgabe in Mathematik",
            "title_short": "SA in Mathematik",
            "class": "event-important",
            "start": "1732834800000",
            "end": "1732913200000",
            "bo_end": "0"
        }
    ]
}"""

_EXAM_KW_RE = re.compile(
    r"\b(schulaufgabe|kurzarbeit|klausur|klassenarbeit|stegreifaufgabe|stehgreifaufgabe|"
    r"extemporale|ex|test|vokabeltest|abfrage|vokabelabfrage|leistungskontrolle|probearbeit|"
    r"kolloquium|prüfung|pruefung|sa|ka)\b|\b\w*(?:test|arbeit|klausur|prüfung|pruefung)\b",
    re.IGNORECASE,
)


def extract_exam_subject(
    title: str,
    title_short: str = "",
    aliases: dict[str, list[str]] | None = None,
    existing_subjects: list[str] | None = None,
) -> str:
    """Extract and resolve subject name from exam title or short title."""
    if not title and not title_short:
        return ""

    texts = [title.strip(), title_short.strip()]
    existing = [s.strip() for s in (existing_subjects or []) if s.strip()]

    # Pattern 1: Look for ' in <Candidate>'
    for txt in texts:
        if not txt:
            continue
        m = re.search(r"\bin\s+([A-Za-z0-9äöüÄÖÜß/\-_]+)", txt, re.IGNORECASE)
        if m:
            cand = m.group(1).strip()
            resolved, _ = resolve_subject_with_index(cand, aliases, existing)
            if resolved:
                return resolved

    # Pattern 2: Look for known subjects or aliases directly in text tokens
    for txt in texts:
        if not txt:
            continue
        for s in existing:
            if re.search(r"\b" + re.escape(s) + r"\b", txt, re.IGNORECASE):
                return s

        if aliases:
            for key, alias_list in aliases.items():
                if re.search(r"\b" + re.escape(key) + r"\b", txt, re.IGNORECASE):
                    return key
                if isinstance(alias_list, list):
                    for a in alias_list:
                        a_clean = str(a).split("->")[0].split("➔")[0].strip()
                        if a_clean and re.search(r"\b" + re.escape(a_clean) + r"\b", txt, re.IGNORECASE):
                            return key

        for key, alias_list in DEFAULT_SUBJECT_ALIASES.items():
            if re.search(r"\b" + re.escape(key) + r"\b", txt, re.IGNORECASE):
                return key
            for a in alias_list:
                a_clean = str(a).split("->")[0].split("➔")[0].strip()
                if a_clean and re.search(r"\b" + re.escape(a_clean) + r"\b", txt, re.IGNORECASE):
                    return key

    return ""


def parse_appointments(
    raw_data: Any,
    aliases: dict[str, list[str]] | None = None,
    existing_subjects: list[str] | None = None,
    ignore_info_events: bool = False,
) -> list[dict[str, Any]]:
    """Parse appointment and exam entries from JSON string, dict, or Appointment objects."""
    if not raw_data:
        return []

    data: Any = raw_data
    if isinstance(raw_data, str):
        try:
            data = json.loads(raw_data)
        except Exception as json_err:
            _LOGGER.debug("Could not parse appointments as JSON string: %s", json_err)
            return []

    items: list[Any] = []
    if isinstance(data, dict):
        if "result" in data and isinstance(data["result"], list):
            items = data["result"]
        elif "appointments" in data and isinstance(data["appointments"], list):
            items = data["appointments"]
        else:
            items = [data]
    elif isinstance(data, list):
        items = data

    out: list[dict[str, Any]] = []

    def _parse_timestamp_or_dt(val: Any) -> datetime | None:
        if isinstance(val, datetime):
            return val
        if isinstance(val, date):
            return datetime.combine(val, dt_time(8, 0))
        if isinstance(val, (int, float)):
            sec = val / 1000.0 if val > 1e11 else float(val)
            try:
                return datetime.fromtimestamp(sec, tz=BERLIN_TZ) if BERLIN_TZ else datetime.fromtimestamp(sec)
            except Exception:
                return None
        if isinstance(val, str):
            s = val.strip()
            if not s:
                return None
            if s.isdigit() or (s.replace(".", "", 1).isdigit() and "." in s):
                try:
                    num = float(s)
                    sec = num / 1000.0 if num > 1e11 else num
                    return datetime.fromtimestamp(sec, tz=BERLIN_TZ) if BERLIN_TZ else datetime.fromtimestamp(sec)
                except Exception:
                    pass
            try:
                return datetime.fromisoformat(s)
            except Exception:
                pass
            m = re.match(r"^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?", s)
            if m:
                d, mo, yr = int(m.group(1)), int(m.group(2)), int(m.group(3))
                hr = int(m.group(4)) if m.group(4) else 8
                mi = int(m.group(5)) if m.group(5) else 0
                return datetime(yr, mo, d, hr, mi)
        return None

    for item in items:
        if not item:
            continue

        if isinstance(item, dict):
            apt_id = str(item.get("id") or item.get("appointment_id") or "")
            title = str(item.get("title") or "").strip()
            title_short = str(item.get("title_short") or item.get("short") or "").strip()
            classname = str(item.get("class") or item.get("classname") or item.get("className") or "").strip()
            raw_start = item.get("start")
            raw_end = item.get("end")
        else:
            apt_id = str(getattr(item, "appointment_id", getattr(item, "id", "")))
            title = str(getattr(item, "title", "")).strip()
            title_short = str(getattr(item, "short", getattr(item, "title_short", ""))).strip()
            classname = str(getattr(item, "classname", getattr(item, "class", getattr(item, "className", "")))).strip()
            raw_start = getattr(item, "start", None)
            raw_end = getattr(item, "end", None)

        if not title and not title_short:
            continue

        start_dt = _parse_timestamp_or_dt(raw_start)
        end_dt = _parse_timestamp_or_dt(raw_end)

        if start_dt is None:
            continue

        date_iso = start_dt.strftime("%Y-%m-%d")

        is_exam = False
        class_l = classname.lower()
        if any(kw in class_l for kw in ("important", "klausur", "exam", "pruefung")):
            is_exam = True
        elif _EXAM_KW_RE.search(title) or _EXAM_KW_RE.search(title_short):
            is_exam = True

        if ignore_info_events and not is_exam and ("info" in class_l or class_l == "event-info"):
            continue

        subject = extract_exam_subject(title, title_short, aliases, existing_subjects)

        start_iso = start_dt.isoformat()
        end_iso = end_dt.isoformat() if end_dt else start_iso

        out.append(
            {
                "id": apt_id,
                "title": title or title_short,
                "title_short": title_short,
                "class": classname,
                "class_name": classname,
                "start": start_iso,
                "end": end_iso,
                "date": date_iso,
                "is_exam": is_exam,
                "subject": subject,
                "origin": "elternportal",
            }
        )

    out.sort(key=lambda x: (x["date"], x["start"], x["title"]))
    return out


def convert_portal_lessons_to_timetable(
    lessons: list[dict[str, Any]],
    aliases: dict[str, list[str]] | None = None,
    existing_subjects: list[str] | None = None,
    existing_slots: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Convert parsed portal lessons into SchoolGradesData timetable structure."""
    slots = [dict(s) for s in (existing_slots if existing_slots else DEFAULT_TIMETABLE_SLOTS)]
    schedule: dict[str, dict[str, Any]] = {}

    lesson_times: dict[str, tuple[str | None, str | None]] = {}
    for item in lessons:
        num = str(item.get("lesson", "")).strip()
        if not num:
            continue
        st = item.get("start")
        et = item.get("end")
        if num not in lesson_times or (st and not lesson_times[num][0]):
            lesson_times[num] = (st, et)

    for num, (start_t, end_t) in sorted(
        lesson_times.items(),
        key=lambda x: int(re.search(r"\d+", x[0]).group(0)) if re.search(r"\d+", x[0]) else 99,
    ):
        slot_match = next(
            (s for s in slots if str(s.get("number", "")) == num or s.get("id") == f"slot_{num}"),
            None,
        )
        if not slot_match:
            new_slot = {
                "id": f"slot_{num}",
                "type": "lesson",
                "number": num,
                "label": f"{num}. Stunde",
                "start": start_t or "08:00",
                "end": end_t or "08:45",
            }
            slots.append(new_slot)
        else:
            if start_t and not slot_match.get("start"):
                slot_match["start"] = start_t
            if end_t and not slot_match.get("end"):
                slot_match["end"] = end_t

    def _parse_time_mins(time_str: str | None) -> int:
        if not time_str or ":" not in str(time_str):
            return 9999
        parts = str(time_str).strip().split(":")
        try:
            return int(parts[0]) * 60 + int(parts[1])
        except (ValueError, IndexError):
            return 9999

    def _slot_sort_key(s: dict[str, Any]) -> tuple[int, int]:
        time_mins = _parse_time_mins(s.get("start"))
        num_m = re.search(r"\d+", str(s.get("number", "") or s.get("label", "")))
        num_val = int(num_m.group(0)) if num_m else 99
        return (time_mins, num_val)

    slots.sort(key=_slot_sort_key)

    for item in lessons:
        num = str(item.get("lesson", "")).strip()
        weekday_num = item.get("weekday", 1)
        day_key = WEEKDAY_MAP.get(weekday_num, "monday")

        slot_match = next(
            (s for s in slots if str(s.get("number", "")) == num or s.get("id") == f"slot_{num}"),
            None,
        )
        slot_id = slot_match["id"] if slot_match else f"slot_{num}"

        if slot_id not in schedule:
            schedule[slot_id] = {}

        raw_subject = str(item.get("subject", "")).strip()
        raw_room = str(item.get("room", "")).strip()
        raw_teacher = str(item.get("teacher", "")).strip()

        resolved_subject, matched_idx = resolve_subject_with_index(
            raw_subject, aliases, existing_subjects
        )

        final_room = raw_room
        final_teacher = raw_teacher

        if matched_idx is not None:
            if "/" in raw_teacher:
                teacher_parts = [p.strip() for p in raw_teacher.split("/")]
                if 0 <= matched_idx < len(teacher_parts):
                    final_teacher = teacher_parts[matched_idx]

            if "/" in raw_room:
                room_parts = [p.strip() for p in raw_room.split("/")]
                if 0 <= matched_idx < len(room_parts):
                    final_room = room_parts[matched_idx]

        schedule[slot_id][day_key] = {
            "subject": resolved_subject,
            "room": final_room,
            "teacher": final_teacher,
            "raw_subject": raw_subject,
            "raw_room": raw_room,
            "raw_teacher": raw_teacher,
        }

    return {"slots": slots, "schedule": schedule}


async def async_validate_and_get_students(
    session: aiohttp.ClientSession,
    school: str,
    username: str,
    password: str,
) -> dict[str, Any]:
    """Test connection with Eltern-Portal credentials and return list of students."""
    clean_school = school_from_input(school)
    if not clean_school:
        return {
            "success": False,
            "error": "empty_school",
            "message": "Bitte gib ein Schulkürzel oder eine Eltern-Portal URL an.",
        }

    if not HAVE_PYELTERNPORTAL:
        _LOGGER.warning("pyelternportal is not installed in the current environment")
        return {
            "success": False,
            "error": "missing_library",
            "message": "Die Bibliothek pyelternportal ist noch nicht geladen. Bitte starte Home Assistant neu.",
        }

    try:
        api = ElternPortalAPI(session)
        api.set_config(clean_school, username.strip(), password)
        await api.async_validate_config()

        students: list[dict[str, Any]] = []
        for st in getattr(api, "students", []):
            students.append(
                {
                    "student_id": str(getattr(st, "student_id", "")),
                    "fullname": getattr(st, "fullname", "") or "",
                    "firstname": getattr(st, "firstname", "") or "",
                    "lastname": getattr(st, "lastname", "") or "",
                    "classname": getattr(st, "classname", "") or "",
                }
            )

        school_name = (getattr(api, "school_name", "") or clean_school).strip()

        return {
            "success": True,
            "school": clean_school,
            "school_name": school_name,
            "students": students,
        }

    except BadCredentialsException as err:
        _LOGGER.debug("Eltern-Portal authentication failed: %s", err)
        return {
            "success": False,
            "error": "invalid_auth",
            "message": "Ungültige Zugangsdaten. Bitte überprüfe Benutzername und Passwort.",
        }
    except ResolveHostnameException as err:
        _LOGGER.debug("Eltern-Portal hostname resolution failed: %s", err)
        return {
            "success": False,
            "error": "invalid_school",
            "message": f"Die Schule '{clean_school}' konnte auf eltern-portal.org nicht gefunden werden.",
        }
    except CannotConnectException as err:
        _LOGGER.debug("Eltern-Portal connection failed: %s", err)
        return {
            "success": False,
            "error": "cannot_connect",
            "message": "Verbindung zum Eltern-Portal fehlgeschlagen. Bitte prüfe die Internetverbindung.",
        }
    except StudentListException as err:
        _LOGGER.debug("Eltern-Portal student list missing: %s", err)
        return {
            "success": False,
            "error": "no_students",
            "message": "Anmeldung erfolgreich, aber es wurden keine Kinder im Account gefunden.",
        }
    except ClientErrorType as err:
        _LOGGER.debug("Eltern-Portal HTTP client error: %s", err)
        return {
            "success": False,
            "error": "network_error",
            "message": f"Netzwerkfehler beim Verbinden mit eltern-portal.org: {err}",
        }
    except Exception as err:  # noqa: BLE001
        _LOGGER.exception("Unexpected error validating Eltern-Portal credentials")
        return {
            "success": False,
            "error": "unknown",
            "message": f"Unerwarteter Fehler: {err}",
        }


async def async_fetch_child_portal_data(
    session: aiohttp.ClientSession | None = None,
    school: str = "",
    username: str = "",
    password: str = "",
    student_id: str = "",
    fetch_timetable: bool = True,
    fetch_substitutions: bool = True,
    fetch_appointments: bool = True,
    aliases: dict[str, list[str]] | None = None,
    existing_subjects: list[str] | None = None,
    ignore_info_events: bool = False,
) -> dict[str, Any]:
    """Fetch timetable, substitution, and appointment data from Eltern-Portal for a specific child."""
    clean_school = school_from_input(school)
    if not clean_school:
        return {"success": False, "error": "empty_school", "message": "Keine Schulkennung angegeben"}

    if not HAVE_PYELTERNPORTAL:
        return {
            "success": False,
            "error": "missing_library",
            "message": "pyelternportal ist in dieser Umgebung nicht geladen.",
        }

    is_demo = clean_school == "demo"

    try:
        api = ElternPortalAPI(session)
        api.set_config(clean_school, username.strip(), password)

        if is_demo:
            await api.async_base_demo()
            await api.async_login_demo()
        else:
            await api.async_base_online()
            await api.async_login_online()

        match_student = None
        for st in getattr(api, "students", []):
            if str(getattr(st, "student_id", "")) == str(student_id):
                match_student = st
                break
        if not match_student and getattr(api, "students", []):
            match_student = api.students[0]

        if not match_student:
            if not is_demo:
                try:
                    await api.async_logout_online()
                except Exception:
                    pass
            return {
                "success": False,
                "error": "student_not_found",
                "message": "Kind im Eltern-Portal Account nicht gefunden",
            }

        api._student = match_student
        if is_demo:
            await api.async_set_child_demo()
        else:
            await api.async_set_child_online()

        timetable_data: list[dict[str, Any]] = []
        substitutions_data: dict[str, Any] = {"available": False, "stand": None, "days": []}
        appointments_data: list[dict[str, Any]] = []

        # Fetch Timetable
        if fetch_timetable:
            try:
                if is_demo:
                    from pyelternportal.demo import DEMO_HTML_LESSON
                    timetable_data = parse_timetable(DEMO_HTML_LESSON)
                else:
                    url = parse.urljoin(api.base_url, "/service/stundenplan")
                    async with session.get(url) as resp:
                        if resp.status == 200:
                            html = await resp.text()
                            timetable_data = parse_timetable(html)
            except Exception as tt_err:
                _LOGGER.warning("Could not fetch timetable from Eltern-Portal: %s", tt_err)

        # Fetch Substitutions
        if fetch_substitutions:
            try:
                if is_demo:
                    from pyelternportal.demo import DEMO_HTML_SUBSTITUTION
                    substitutions_data = parse_substitutions(DEMO_HTML_SUBSTITUTION)
                else:
                    url = parse.urljoin(api.base_url, "/service/vertretungsplan")
                    async with session.get(url) as resp:
                        if resp.status == 200:
                            html = await resp.text()
                            substitutions_data = parse_substitutions(html)
            except Exception as subst_err:
                _LOGGER.warning("Could not fetch substitutions from Eltern-Portal: %s", subst_err)

        # Fetch Appointments / Exams
        if fetch_appointments:
            try:
                if is_demo:
                    demo_raw = DEMO_JSON_APPOINTMENT
                    try:
                        from pyelternportal.demo import DEMO_JSON_APPOINTMENT as PY_DEMO_JSON_APPOINTMENT
                        demo_raw = PY_DEMO_JSON_APPOINTMENT
                    except Exception:
                        pass
                    appointments_data = parse_appointments(
                        demo_raw,
                        aliases=aliases,
                        existing_subjects=existing_subjects,
                        ignore_info_events=ignore_info_events,
                    )
                else:
                    url = parse.urljoin(api.base_url, "/api/ws_get_termine.php")
                    async with session.get(url) as resp:
                        if resp.status == 200:
                            try:
                                json_data = await resp.json(content_type=None)
                            except Exception:
                                text_data = await resp.text()
                                json_data = json.loads(text_data)
                            appointments_data = parse_appointments(
                                json_data,
                                aliases=aliases,
                                existing_subjects=existing_subjects,
                                ignore_info_events=ignore_info_events,
                            )
            except Exception as apt_err:
                _LOGGER.warning("Could not fetch appointments from Eltern-Portal: %s", apt_err)

            # Fallback if student has appointments populated on api
            if not appointments_data and getattr(match_student, "appointments", None):
                try:
                    appointments_data = parse_appointments(
                        match_student.appointments,
                        aliases=aliases,
                        existing_subjects=existing_subjects,
                        ignore_info_events=ignore_info_events,
                    )
                except Exception as fb_err:
                    _LOGGER.debug("Could not parse student.appointments fallback: %s", fb_err)

        if not is_demo:
            try:
                await api.async_logout_online()
            except Exception:
                pass

        return {
            "success": True,
            "school": clean_school,
            "student_id": str(getattr(match_student, "student_id", student_id)),
            "student_name": getattr(match_student, "fullname", ""),
            "timetable": timetable_data,
            "substitutions": substitutions_data,
            "appointments": appointments_data,
        }

    except BadCredentialsException as err:
        _LOGGER.debug("Eltern-Portal bad credentials: %s", err)
        return {
            "success": False,
            "error": "bad_credentials",
            "message": "Anmeldung im Eltern-Portal fehlgeschlagen (Benutzername oder Passwort falsch). Bitte Zugangsdaten in den Einstellungen prüfen.",
        }
    except CannotConnectException as err:
        _LOGGER.debug("Eltern-Portal cannot connect: %s", err)
        return {
            "success": False,
            "error": "cannot_connect",
            "message": f"Verbindung zum Eltern-Portal fehlgeschlagen: {err}",
        }
    except ResolveHostnameException as err:
        _LOGGER.debug("Eltern-Portal hostname resolution failed: %s", err)
        return {
            "success": False,
            "error": "invalid_school",
            "message": f"Die Schule '{clean_school}' konnte auf eltern-portal.org nicht gefunden werden.",
        }
    except StudentListException as err:
        _LOGGER.debug("Eltern-Portal student list missing: %s", err)
        return {
            "success": False,
            "error": "no_students",
            "message": "Anmeldung erfolgreich, aber es wurden keine Kinder im Account gefunden.",
        }
    except Exception as err:
        _LOGGER.exception("Error fetching child portal data: %s", err)
        return {
            "success": False,
            "error": "fetch_error",
            "message": f"Fehler beim Abruf aus Eltern-Portal: {err}",
        }
