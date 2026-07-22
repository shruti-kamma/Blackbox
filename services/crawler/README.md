# Crawler Agent

Crawls public pages (careers sites, accessibility statements, DEI reports) for
companies and universities, extracting signals that feed the scoring agent.

Writes `CrawlRun` / `CrawlFinding` rows to the shared Postgres DB (see `packages/db`).

## Local dev

```
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
