import uuid

from fastapi import FastAPI

from app.schemas import CrawlRequest, CrawlRunResponse

app = FastAPI(
    title="Blackbox Crawler Agent",
    description="Crawls company/university public pages for accessibility & inclusion signals.",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/crawl-runs", response_model=CrawlRunResponse)
def create_crawl_run(request: CrawlRequest) -> CrawlRunResponse:
    # Stub: real implementation enqueues a Celery task that fetches
    # request.seed_url, extracts accessibility signals, and writes
    # CrawlRun/CrawlFinding rows via the shared Postgres DB.
    return CrawlRunResponse(
        crawl_run_id=str(uuid.uuid4()),
        organization_id=request.organization_id,
        status="pending",
    )
