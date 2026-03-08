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

    prompt = f"""
    You are a Staff Security & Quality Engineer. Review the following repository structure and dependencies
    to infer Code Quality and Security Posture. 

    Languages: {json.dumps(repo_data.get('languages', {}))}
    Dependencies: {json.dumps(repo_data.get('dependencies', []))}
    File Tree Snapshot: {json.dumps(repo_data.get('file_tree', [])[:200])}

    Output EXACTLY this JSON structure, and nothing else:
    {{
        "overall_score": 85, 
        "strengths": ["Uses Docker", "Has GitHub Actions CI/CD"],
        "weaknesses": ["Missing tests directory", "No dependabot tracking"],
        "security_issues": ["Potential hardcoded secret in config.example"]
    }}
    (Score from 0-100 indicating inferred quality).
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
