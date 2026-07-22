# Matching Agent

Matches candidates to jobs using embedding similarity (pgvector) over
`CandidateProfile.embedding` / `Job.embedding`, plus Claude for ranking and
explaining shortlists against accessibility needs vs. accommodations offered.

## Local dev

```
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```
