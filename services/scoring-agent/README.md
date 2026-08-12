# Scoring Agent

Generates the accessibility/inclusion score shown on the rankings site,
from `services/crawler/scripts/extract_pwd_signals.py`'s extraction
output — 10 equally-weighted metrics (see `docs/decisions.md` — "Scoring
methodology"), 0-100 each, `overall_score` = their mean.

## FastAPI skeleton (`app/`)

Stubbed only — not yet wired to real scoring logic or Postgres.

```
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

## Scoring script (`scripts/score_orgs.py`) — the real current pipeline

Standalone script, same pattern as the crawler's scripts — reads
extraction JSON from `services/crawler/data/pwd_extractions/`, not the
FastAPI app above.

```
python scripts/score_orgs.py --mock --pilot 10   # verify plumbing, no API calls
python scripts/score_orgs.py --pilot 10           # real run, random sample
python scripts/score_orgs.py --company MFSL
python scripts/score_orgs.py --all                 # every company with an extraction
```

Output: one JSON file per company in `data/scores/` (gitignored), matching
the `AccessibilityScore` shape — `overall_score`, `breakdown` (10 items:
category, subscore, industry_average, rationale, recommendation).
