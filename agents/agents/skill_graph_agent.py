import json
from agents.llm_utils import get_llm

LEVEL_THRESHOLDS = {
    "Expert":       90,
    "Advanced":     75,
    "Proficient":   55,
    "Intermediate": 35,
    "Beginner":     0,
}

def _get_llm():
    return get_llm()

def _format_deps(deps: dict) -> str:
    lines = []
    for fname, content in deps.items():
        lines.append(f"  [{fname}]: {str(content)[:300]}")
    return "\n".join(lines) if lines else "  None found"

def extract_skills(repo_data: dict) -> dict:
    """
    Infers developer skills from repo structure and dependencies.
    Returns ranked skill list with scores and levels.
    """
    repo_name = f"{repo_data.get('owner', 'unknown')}/{repo_data.get('name', 'unknown')}"
    file_tree = repo_data.get("file_tree", [])
    llm = _get_llm()

    prompt = f"""Analyze this developer's GitHub repository and extract their skill profile.

Repository: {repo_name}
Languages breakdown: {json.dumps(repo_data.get('languages', {}))}
Folder structure: {', '.join(file_tree[:100])}
Dependencies:
{_format_deps(repo_data.get('dependencies', {}))}

Return ONLY a valid JSON array of 8-12 skills, sorted by score descending:
[
  {{
    "skill": "<technology name>",
    "score": <0-100 integer>,
    "level": "<Expert|Advanced|Proficient|Intermediate|Beginner>",
    "evidence": "<brief reason, max 8 words>",
    "category": "<Language|Framework|Infrastructure|Database|Tool|Methodology>"
  }}
]

Infer skills from:
- Language percentages → language proficiency
- go.mod / requirements.txt / package.json → framework/library skills
- docker-compose.yml → DevOps/infrastructure skills
- Folder patterns (agents/, graph/) → AI/ML skills
- Database folder → DB skills
- Test files → testing skills"""

    response = llm.invoke(prompt)
    raw = response.content.strip().replace("```json", "").replace("```", "").strip()
    skills = json.loads(raw)

    # Normalize levels based on score
    for skill in skills:
        score = skill.get("score", 0)
        for level, threshold in LEVEL_THRESHOLDS.items():
            if score >= threshold:
                skill["level"] = level
                break

    return {"skills": skills, "total_skills": len(skills)}