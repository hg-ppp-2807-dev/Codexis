import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Load explicitly from the project root configs
load_dotenv("../configs/.env")
from graph.workflow import run_analysis_workflow
from agents.health_score_agent import compute_health_score
from agents.pr_review_agent import review_pull_request
from agents.skill_graph_agent import extract_skills
from agents.refactor_agent import generate_refactor_suggestions
from agents.architecture_diagram import architecture_diagram_simple

app = FastAPI(title="Codexis AI Agents")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class RepoDataDTO(BaseModel):
    url: str
    owner: str
    name: str
    languages: Dict[str, int] = {}
    file_tree: List[str] = []
    dependencies: Dict[str, str] = {}
    readme: str = ""
    has_existing_readme: bool = False
    recent_commits: List[str] = []

class RepoData(BaseModel):
    repo_name: str = ""
    url: str = ""
    owner: str = ""
    name: str = ""
    languages: Dict[str, int] = {}
    structure: List[str] = []
    dependencies: Dict[str, str] = {}
    file_tree: List[str] = []

class PRReviewRequest(BaseModel):
    pr_diff: str
    context: Optional[Dict[str, Any]] = None

@app.post("/analyze")
async def analyze_repo(data: RepoDataDTO):
    try:
        # Run the LangGraph workflow
        result = await run_analysis_workflow(data.dict())
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ── FEATURE 1: Architecture Diagram ──────────────────────────────────────────

@app.post("/api/features/architecture")
async def architecture_endpoint(repo: RepoData):
    try:
        result = architecture_diagram_simple(repo.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── FEATURE 2: Health Score ───────────────────────────────────────────────────

@app.post("/api/features/health-score")
async def health_score_endpoint(repo: RepoData):
    try:
        result = compute_health_score(repo.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── FEATURE 3: PR Reviewer ────────────────────────────────────────────────────

@app.post("/api/features/pr-review")
async def pr_review_endpoint(request: PRReviewRequest):
    if not request.pr_diff.strip():
        raise HTTPException(status_code=400, detail="pr_diff cannot be empty")
    try:
        result = review_pull_request(request.pr_diff, request.context)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── FEATURE 4: Skill Graph ────────────────────────────────────────────────────

@app.post("/api/features/skills")
async def skills_endpoint(repo: RepoData):
    try:
        result = extract_skills(repo.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── FEATURE 5: Refactor Suggestions ──────────────────────────────────────────

@app.post("/api/features/refactor")
async def refactor_endpoint(repo: RepoData):
    try:
        result = generate_refactor_suggestions(repo.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "codexis-agents"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AGENT_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
