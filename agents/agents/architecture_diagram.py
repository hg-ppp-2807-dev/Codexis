import json
from graph.state import GraphState
from agents.llm_utils import get_llm

def _get_llm():
    return get_llm()

def architecture_diagram_simple(repo_data: dict) -> dict:
    """
    Standalone function for the /api/features/architecture endpoint.
    Generates ASCII and Mermaid diagrams from repo data.
    """
    llm = _get_llm()
    
    repo_name = f"{repo_data.get('owner', 'unknown')}/{repo_data.get('name', 'unknown')}"
    file_tree = repo_data.get('file_tree', [])
    dependencies = repo_data.get('dependencies', {})

    prompt = f"""Analyze this repository and generate TWO architecture representations.

Repository: {repo_name}
Languages: {json.dumps(repo_data.get('languages', {}))}
Folder structure: {', '.join(file_tree[:100])}
Dependencies:
{_format_deps(dependencies)}

Return ONLY valid JSON, no markdown, no explanation:
{{
  "ascii_diagram": "<ascii art using box-drawing chars>",
  "mermaid_code": "<valid mermaid graph TD code>",
  "pattern": "<Monolithic|Microservices|Clean Architecture|Hexagonal|Monorepo|MVC>",
  "layers": ["<layer1>", "<layer2>"],
  "summary": "<one sentence description>"
}}"""

    response = llm.invoke(prompt)
    raw = response.content.strip().replace("```json", "").replace("```", "").strip()
    return json.loads(raw)

def _format_deps(deps: dict) -> str:
    """Format dependency files for the prompt."""
    lines = []
    for fname, content in deps.items():
        lines.append(f"  [{fname}]: {content[:300]}")
    return "\n".join(lines) if lines else "  No dependency files found"

def architecture_diagram(state: GraphState) -> GraphState:
    """
    Agent 5 (new): Generates ASCII architecture diagram + Mermaid code from repo data.
    Extends the existing architecture analysis with visual diagrams.
    """
    repo_data = state["repo_data"]
    llm = _get_llm()
    
    repo_name = f"{repo_data.get('owner', 'unknown')}/{repo_data.get('name', 'unknown')}"
    languages = repo_data.get('languages', {})
    file_tree = repo_data.get('file_tree', [])
    dependencies = repo_data.get('dependencies', {})

    prompt = f"""Analyze this repository and generate TWO architecture representations.

Repository: {repo_name}
Languages: {json.dumps(languages)}
Folder structure: {', '.join(file_tree[:100])}
Dependencies:
{_format_deps(dependencies)}

Return ONLY valid JSON, no markdown, no explanation:
{{
  "ascii_diagram": "<ascii art using box-drawing chars ┌─┐│└─┘ showing system layers and data flow>",
  "mermaid_code": "<valid mermaid graph TD code>",
  "pattern": "<Monolithic|Microservices|Clean Architecture|Hexagonal|Monorepo|MVC>",
  "layers": ["<layer1>", "<layer2>"],
  "summary": "<one sentence description of the architecture>"
}}"""

    response = llm.invoke(prompt)
    try:
        raw = response.content.strip()
        # Strip markdown code blocks if present
        raw = raw.replace("```json", "").replace("```", "").strip()
        
        diagram_data = json.loads(raw)
        
        # Merge with existing architecture data or create new
        existing_architecture = state.get("architecture", {})
        if isinstance(existing_architecture, dict):
            # Add diagram fields to existing architecture
            existing_architecture["ascii_diagram"] = diagram_data.get("ascii_diagram", "")
            existing_architecture["mermaid_code"] = diagram_data.get("mermaid_code", "")
            existing_architecture["pattern"] = diagram_data.get("pattern", existing_architecture.get("pattern", "Unknown"))
            existing_architecture["layers"] = diagram_data.get("layers", [])
            existing_architecture["diagram_summary"] = diagram_data.get("summary", "")
            state["architecture"] = existing_architecture
        else:
            # Create new architecture object with diagrams
            state["architecture"] = {
                "pattern": diagram_data.get("pattern", "Unknown"),
                "rationale": "",
                "suggestions": [],
                "ascii_diagram": diagram_data.get("ascii_diagram", ""),
                "mermaid_code": diagram_data.get("mermaid_code", ""),
                "layers": diagram_data.get("layers", []),
                "diagram_summary": diagram_data.get("summary", "")
            }
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error in architecture_diagram: {e}")
        # Keep existing architecture data, add empty diagram fields
        existing = state.get("architecture", {})
        if isinstance(existing, dict):
            existing["ascii_diagram"] = ""
            existing["mermaid_code"] = ""
            existing["layers"] = []
            existing["diagram_summary"] = "Failed to generate diagram"
            state["architecture"] = existing
        
    return state