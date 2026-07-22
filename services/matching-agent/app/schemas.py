from pydantic import BaseModel


class MatchRequest(BaseModel):
    candidate_id: str
    top_n: int = 10


class JobMatch(BaseModel):
    job_id: str
    score: float
    rationale: str | None = None


class MatchResponse(BaseModel):
    candidate_id: str
    matches: list[JobMatch]
