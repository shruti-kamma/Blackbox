# Scoring Agent

Generates the accessibility/inclusion score shown on the rankings site.
Reads `CrawlFinding` rows produced by the crawler agent, scores each category
against an accessibility rubric (Claude-assisted reasoning over unstructured
findings), and writes `AccessibilityScore` rows.

## Local dev

```
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```
