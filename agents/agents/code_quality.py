import os
import json
from langchain_mistralai import ChatMistralAI
from graph.state import GraphState

def _get_llm():
    return ChatMistralAI(
        model="mistral-large-latest",
        temperature=0.3,
        mistral_api_key=os.getenv("MISTRAL_API_KEY")
    )

def code_quality(state: GraphState) -> GraphState:
    """Agent 3: Assesses code quality and security practices based on tree and deps."""
    repo_data = state["repo_data"]
    llm = _get_llm()

    file_tree = repo_data.get('file_tree', [])
    score_inputs = {
        "has_tests": any("test" in p.lower() or "spec" in p.lower() for p in file_tree),
        "has_ci": any(".github/workflows" in p for p in file_tree),
        "has_dockerfile": any("Dockerfile" in p for p in file_tree),
        "has_readme": any("README" in p.upper() for p in file_tree),
        "has_env_example": any(".env.example" in p for p in file_tree),
        "has_linting": any(
            p.split("/")[-1] in [".eslintrc", ".eslintrc.json", ".golangci.yml", "pyproject.toml", ".flake8"]
            for p in file_tree
        ),
    }

    base_score = sum([
        25 if score_inputs["has_tests"] else 0,
        20 if score_inputs["has_ci"] else 0,
        15 if score_inputs["has_dockerfile"] else 0,
        15 if score_inputs["has_readme"] else 0,
        15 if score_inputs["has_linting"] else 0,
        10 if score_inputs["has_env_example"] else 0,
    ])

    prompt = f"""
    You are a Staff Security & Quality Engineer. Review the following repository structure and dependencies
    to infer Code Quality and Security Posture. 

    Languages: {json.dumps(repo_data.get('languages', {}))}
    Dependency Files (filename: content): {json.dumps(repo_data.get('dependencies', {}))}
    File Tree: {json.dumps(file_tree)}

    You MUST use this pre-calculated `overall_score`: {base_score}

    Output EXACTLY this JSON structure, and nothing else:
    {{
        "overall_score": {base_score}, 
        "strengths": ["Uses Docker", "Has GitHub Actions CI/CD"],
        "weaknesses": ["Missing tests directory", "No dependabot tracking"],
        "security_issues": ["Potential hardcoded secret in config.example"]
    }}
    (Score must match the pre-calculated {base_score}).
    """

    response = llm.invoke(prompt)
    try:
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        state["code_quality"] = json.loads(content)
    except Exception as e:
        print(f"JSON Parse Error in code_quality: {e}")
        state["code_quality"] = {"error": "Failed to parse code quality"}
        
    return state
