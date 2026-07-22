from pydantic import BaseModel


class ScoreRequest(BaseModel):
    organization_id: str


class ScoreBreakdown(BaseModel):
    category: str
    subscore: float
    rationale: str


class ScoreResponse(BaseModel):
    organization_id: str
    overall_score: float
    breakdown: list[ScoreBreakdown]
    methodology_version: str
