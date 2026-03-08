from typing import TypedDict, Dict, Any, List

class GraphState(TypedDict):
    # Input from Go API
    repo_data: Dict[str, Any]
    
    # Internal state passed between agents
    summary: str
    tech_stack: Dict[str, Any]
    code_quality: Dict[str, Any]
    architecture: Dict[str, Any]
    skills: Dict[str, Any]
    generated_readme: str
