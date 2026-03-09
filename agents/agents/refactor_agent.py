import json
from agents.llm_utils import get_llm

def _get_llm():
    return get_llm()

def _format_deps(deps: dict) -> str:
    lines = []
    for fname, content in deps.items():
        lines.append(f"  [{fname}]: {str(content)[:300]}")
    return "\n".join(lines) if lines else "  None"

def generate_refactor_suggestions(repo_data: dict) -> dict:
    """
    Generates staff-engineer level refactoring recommendations.
    Returns 3 concrete suggestions with before/after code.
    """
    repo_name = f"{repo_data.get('owner', 'unknown')}/{repo_data.get('name', 'unknown')}"
    file_tree = repo_data.get("file_tree", [])
    llm = _get_llm()

    prompt = f"""You are a staff engineer reviewing this codebase for refactoring opportunities.

Repository: {repo_name}
Languages: {json.dumps(repo_data.get('languages', {}))}
Folder structure: {', '.join(file_tree[:100])}
Dependencies:
{_format_deps(repo_data.get('dependencies', {}))}

Generate exactly 3 high-value refactoring suggestions. Return ONLY valid JSON:
[
  {{
    "title": "<concise action title>",
    "impact": "<high|medium|low>",
    "reason": "<why this is a problem, max 15 words>",
    "before": "<realistic pseudo-code showing current bad pattern, 4-8 lines>",
    "after": "<improved code showing the fix, 4-8 lines>",
    "effort": "<e.g. 1 day | 3 days | 1 week>",
    "benefit": "<what improves after this change>"
  }}
]

Focus on:
1. Architecture/design pattern violations (coupling, SRP, etc.)
2. Performance or scalability issues
3. Maintainability or testability improvements

Base suggestions on the ACTUAL stack detected (Go/Python/TypeScript).
Use realistic code in the language of the affected component."""

    response = llm.invoke(prompt)
    raw = response.content.strip().replace("```json", "").replace("```", "").strip()
    suggestions = json.loads(raw)
    return {"suggestions": suggestions}