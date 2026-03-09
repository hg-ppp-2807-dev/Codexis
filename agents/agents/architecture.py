import os
import json
from langchain_mistralai import ChatMistralAI
from graph.state import GraphState

def _get_llm():
    return ChatMistralAI(
        model="mistral-large-latest",
        temperature=0.2,
        mistral_api_key=os.getenv("MISTRAL_API_KEY")
    )

def architecture(state: GraphState) -> GraphState:
    """Agent 4: Reviews architectural patterns (Microservices, Monolith, Clean Arch)."""
    repo_data = state["repo_data"]
    llm = _get_llm()

    prompt = f"""
    You are a Principal Architect. Review the repository metadata to determine the software architecture.

    Languages: {json.dumps(repo_data.get('languages', {}))}
    Dependency Files (filename: content): {json.dumps(repo_data.get('dependencies', {}))}
    File Tree Snapshot: {json.dumps(repo_data.get('file_tree', []))}
    Detected Stack: {json.dumps(state.get('tech_stack', {}))}

    Based on the folder names (e.g., 'controllers', 'services', 'ui', 'apps/', 'packages/'), 
    identify the architectural pattern (e.g., Monolithic, Microservices, Clean Architecture, Serverless, Monorepo).

    Output EXACTLY this JSON structure, and nothing else:
    {{
        "pattern": "Clean Architecture",
        "rationale": "Separation of concerns visible in controllers/ and services/ folders.",
        "suggestions": [
            "Consider adding a repository layer for better data abstraction.",
            "Introduce Redis for caching to improve API response time."
        ]
    }}
    """

    response = llm.invoke(prompt)
    try:
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        state["architecture"] = json.loads(content)
    except Exception as e:
        print(f"JSON Parse Error in architecture: {e}")
        state["architecture"] = {"error": "Failed to parse architecture"}
        
    return state
