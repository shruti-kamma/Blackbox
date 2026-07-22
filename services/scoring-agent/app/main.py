from fastapi import FastAPI

from app.config import settings
from app.schemas import ScoreRequest, ScoreResponse

app = FastAPI(
    title="Blackbox Scoring Agent",
    description="Generates accessibility/inclusion scores for companies and universities from crawl findings.",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/scores/generate", response_model=ScoreResponse)
def generate_score(request: ScoreRequest) -> ScoreResponse:
    # Stub: real implementation reads CrawlFinding rows for the organization,
    # scores each category against the accessibility rubric (using Claude to
    # reason over unstructured findings), and writes an AccessibilityScore row.
    return ScoreResponse(
        organization_id=request.organization_id,
        overall_score=0.0,
        breakdown=[],
        methodology_version=settings.methodology_version,
    )
