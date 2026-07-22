from pydantic import BaseModel


class CrawlRequest(BaseModel):
    organization_id: str
    seed_url: str


class CrawlRunResponse(BaseModel):
    crawl_run_id: str
    organization_id: str
    status: str
