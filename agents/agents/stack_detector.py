import json
from graph.state import GraphState
from agents.llm_utils import get_llm

def _get_llm():
    return get_llm()

def stack_detector(state: GraphState) -> GraphState:
    """Agent 2: Detects the technology stack with confidence scores."""
    repo_data = state["repo_data"]
    llm = _get_llm()

    prompt = f"""
    You are a senior software architect. Based on the file tree, dependency files contents, and identified languages,
    detect the full technology stack of this repository.

    Languages: {json.dumps(repo_data.get('languages', {}))}
    Dependency Files (filename: content): {json.dumps(repo_data.get('dependencies', {}))}
    File Tree: {json.dumps(repo_data.get('file_tree', []))}

    Output EXACTLY this JSON structure, and nothing else (no markdown blocks like ```json):
    {{
        "categories": [
            {{
                "category": "Frontend",
                "technologies": [
                    {{"name": "React", "confidence": 0.95}}
                ]
            }},
            {{
                "category": "Backend",
                "technologies": [
                    {{"name": "Go", "confidence": 0.99}}
                ]
            }}
        ]
    }}
    Include Database, DevOps, etc. if applicable.
    """

    response = llm.invoke(prompt)
    try:
        # Strip markdown codes if the LLM adds them despite the prompt
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        state["tech_stack"] = json.loads(content)
    except Exception as e:
        print(f"JSON Parse Error in stack_detector: {e}")
        state["tech_stack"] = {"error": "Failed to parse tech stack"}
        
    return state
