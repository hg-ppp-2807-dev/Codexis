import json
from typing import Optional, Dict, Any
from agents.llm_utils import get_llm

def _get_llm():
    return get_llm()

def review_pull_request(pr_diff: str, context: Optional[Dict[str, Any]] = None) -> dict:
    """
    Reviews a PR diff and returns structured feedback.
    pr_diff: raw git diff string
    context: optional dict with repo_name, language, etc.
    """
    ctx_str = ""
    if context:
        ctx_str = f"Repository context: {json.dumps(context)}\n\n"

    llm = _get_llm()

    prompt = f"""{ctx_str}Review this pull request diff like a principal engineer:

{pr_diff}

Return ONLY valid JSON:
{{
  "approve": <true|false>,
  "score": <0-100>,
  "critical": [
    {{"issue": "<what>", "line": "<offending code snippet>", "fix": "<exact fix>"}}
  ],
  "warnings": [
    {{"issue": "<what>", "line": "<offending code snippet>", "fix": "<how to fix>"}}
  ],
  "suggestions": [
    {{"issue": "<improvement>", "fix": "<how>"}}
  ],
  "good": ["<what was done well>"],
  "summary": "<1-2 sentence overall verdict>"
}}

Rules:
- critical: security holes, crashes, data loss, broken logic
- warnings: missing validation, performance issues, bad patterns
- suggestions: style, readability, best practices
- good: acknowledge positive things
- approve: true only if no critical issues"""

    response = llm.invoke(prompt)
    raw = response.content.strip().replace("```json", "").replace("```", "").strip()
    return json.loads(raw)