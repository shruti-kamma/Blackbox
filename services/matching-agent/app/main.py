from fastapi import FastAPI

from app.schemas import MatchRequest, MatchResponse

app = FastAPI(
    title="Blackbox Matching Agent",
    description="LLM-assisted job-candidate matching using embedding similarity + reasoning.",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/match", response_model=MatchResponse)
def match_candidate(request: MatchRequest) -> MatchResponse:
    # Stub: real implementation embeds the candidate profile, runs a pgvector
    # cosine-similarity search against Job.embedding for top_n candidates,
    # then calls Claude to rank/explain the shortlist against accessibility
    # needs vs. accommodations offered.
    return MatchResponse(candidate_id=request.candidate_id, matches=[])
