import json
from agents.llm_utils import get_llm

def _get_llm():
    return get_llm()

def _format_deps(deps: dict) -> str:
    lines = []
    for fname, content in deps.items():
        lines.append(f"  [{fname}]: {str(content)[:200]}")
    return "\n".join(lines) if lines else "  None"

def compute_health_score(repo_data: dict) -> dict:
    """
    Scores a repo across 6 engineering dimensions.
    Returns scores 0-10 per dimension + overall + grade.
    """
    # Pre-compute signal flags from file tree
    file_tree = repo_data.get("file_tree", [])
    signals = {
        "has_tests": any(
            "test" in p.lower() or "spec" in p.lower() or "_test." in p
            for p in file_tree
        ),
        "has_ci": any(
            ".github/workflows" in p or ".gitlab-ci" in p or "Jenkinsfile" in p
            for p in file_tree
        ),
        "has_dockerfile": any("dockerfile" in p.lower() for p in file_tree),
        "has_readme": any("readme" in p.lower() for p in file_tree),
        "has_env_example": any(".env.example" in p for p in file_tree),
        "has_linting": any(
            p.endswith((".eslintrc", ".eslintrc.json", ".golangci.yml", ".flake8", "pyproject.toml"))
            for p in file_tree
        ),
        "has_docker_compose": any("docker-compose" in p for p in file_tree),
        "language_count": len(repo_data.get("languages", {})),
    }

    repo_name = f"{repo_data.get('owner', 'unknown')}/{repo_data.get('name', 'unknown')}"
    llm = _get_llm()

    prompt = f"""You are a senior engineering lead auditing a codebase. Score this repository.

Repository: {repo_name}
Languages: {json.dumps(repo_data.get('languages', {}))}
Folders: {', '.join(file_tree[:100])}
Signals detected: {json.dumps(signals)}
Dependencies: {_format_deps(repo_data.get('dependencies', {}))}

Return ONLY valid JSON:
{{
  "code_quality": <0.0-10.0>,
  "architecture": <0.0-10.0>,
  "maintainability": <0.0-10.0>,
  "security": <0.0-10.0>,
  "documentation": <0.0-10.0>,
  "test_coverage": <0.0-10.0>,
  "overall": <weighted average 0.0-10.0>,
  "grade": "<A|B|C|D|F>",
  "strengths": ["<strength1>", "<strength2>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "summary": "<one sentence overall assessment>"
}}

Scoring guide:
- code_quality: structure, separation of concerns, naming
- architecture: patterns, layer separation, modularity  
- maintainability: readability, complexity, documentation
- security: env handling, secret management, input validation patterns
- documentation: README, code comments, API docs
- test_coverage: presence and quality of tests"""

    response = llm.invoke(prompt)
    raw = response.content.strip().replace("```json", "").replace("```", "").strip()
    return json.loads(raw)