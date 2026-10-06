"""Eltern-Portal (eltern-portal.org) integration helper for Schulnoten."""
from __future__ import annotations

import logging
import re
from typing import Any
from urllib import parse

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

from .const import DEFAULT_SUBJECT_ALIASES

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


def resolve_subject_name(
    raw_name: str,
    aliases_dict: dict[str, list[str]] | None = None,
    existing_subjects: list[str] | None = None,
) -> str:
    """Resolve a subject abbreviation or code to a full subject name."""
    if not raw_name:
        return ""
    clean = raw_name.strip()
    if not clean:
        return ""

    existing = [s.strip() for s in (existing_subjects or []) if s.strip()]
    aliases = aliases_dict if aliases_dict is not None else DEFAULT_SUBJECT_ALIASES

    # 1. Exact match with an existing subject (case-insensitive)
    for s in existing:
        if clean.lower() == s.lower():
            return s

    # 2. Exact match with a key in aliases_dict (case-insensitive)
    for key in aliases.keys():
        if clean.lower() == key.lower():
            for s in existing:
                if key.lower() == s.lower():
                    return s
            return key

    # 3. Match within alias list of aliases_dict
    for key, alias_list in aliases.items():
        if any(clean.lower() == str(a).strip().lower() for a in alias_list):
            for s in existing:
                if s.lower() == key.lower() or any(s.lower() == str(a).strip().lower() for a in alias_list):
                    return s
            return key

    # 4. Prefix match against existing subjects (at least 2 chars)
    if len(clean) >= 2:
        prefix_existing = [s for s in existing if s.lower().startswith(clean.lower())]
        if len(prefix_existing) == 1:
            return prefix_existing[0]

        prefix_aliases = [k for k in aliases.keys() if k.lower().startswith(clean.lower())]
        if len(prefix_aliases) == 1:
            return prefix_aliases[0]

    # 5. Fallback: preserve original cleaned name
    return clean


def parse_subject_aliases_yaml(yaml_text: str) -> dict[str, list[str]]:
    """Parse YAML text into subject aliases dictionary."""
    if not yaml_text or not yaml_text.strip():
        return dict(DEFAULT_SUBJECT_ALIASES)
    try:
        import yaml
        data = yaml.safe_load(yaml_text)
        if not isinstance(data, dict):
            return dict(DEFAULT_SUBJECT_ALIASES)
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
    except Exception as err:
        _LOGGER.warning("Failed to parse subject aliases YAML: %s", err)
        return dict(DEFAULT_SUBJECT_ALIASES)


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
                    subject = texts[3]
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


def convert_portal_lessons_to_timetable(
    lessons: list[dict[str, Any]],
    aliases: dict[str, list[str]] | None = None,
    existing_subjects: list[str] | None = None,
    existing_slots: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Convert parsed portal lessons into SchoolGradesData timetable structure."""
    slots = [dict(s) for s in (existing_slots or [])]
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

    def _slot_sort_key(s: dict[str, Any]) -> int:
        num_m = re.search(r"\d+", str(s.get("number", "")))
        return int(num_m.group(0)) if num_m else 99

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
        resolved_subject = resolve_subject_name(raw_subject, aliases, existing_subjects)

        schedule[slot_id][day_key] = {
            "subject": resolved_subject,
            "room": str(item.get("room", "")).strip(),
            "teacher": str(item.get("teacher", "")).strip(),
            "raw_subject": raw_subject,
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
    session: aiohttp.ClientSession,
    school: str,
    username: str,
    password: str,
    student_id: str,
    fetch_timetable: bool = True,
    fetch_substitutions: bool = True,
) -> dict[str, Any]:
    """Fetch timetable and substitution data from Eltern-Portal for a specific child."""
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
