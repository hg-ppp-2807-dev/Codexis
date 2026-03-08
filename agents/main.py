import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from dotenv import load_dotenv

# Load explicitly from the project root configs
load_dotenv("../configs/.env")
from graph.workflow import run_analysis_workflow

app = FastAPI(title="Codexis AI Agents")

class RepoDataDTO(BaseModel):
    url: str
    owner: str
    name: str
    languages: Dict[str, int] = {}
    file_tree: List[str] = []
    dependencies: List[str] = []
    readme: str = ""
    recent_commits: List[str] = []

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

@app.get("/health")
def health():
    return {"status": "ok", "service": "codexis-agents"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AGENT_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
