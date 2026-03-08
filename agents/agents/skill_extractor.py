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

def skill_extractor(state: GraphState) -> GraphState:
    """Agent 5: Extracts developer skills based on the identified stack and architecture."""
    # We now have access to tech_stack and architecture from previous nodes
    tech_stack = state.get("tech_stack", {})
    architecture = state.get("architecture", {})
    llm = _get_llm()

    prompt = f"""
    You are an AI Tech Recruiter / Developer Profiler.
    Based on the analyzed tech stack and architecture of this project, extract the core developer skills demonstrated.

    Tech Stack Identified previously: {json.dumps(tech_stack)}
    Architecture Identified previously: {json.dumps(architecture)}

    For each skill, assign a confidence level (0.0 to 1.0) of how prominently the skill is displayed.
    Also map it to a broader category (e.g., "Language", "Framework", "Operations", "Concept").

    Output EXACTLY this JSON structure, and nothing else:
    {{
        "skills": [
            {{"name": "Go", "confidence": 0.95, "category": "Language"}},
            {{"name": "Next.js", "confidence": 0.90, "category": "Framework"}},
            {{"name": "Clean Architecture", "confidence": 0.85, "category": "Concept"}},
            {{"name": "REST API Design", "confidence": 0.80, "category": "Concept"}}
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
        state["skills"] = json.loads(content)
    except Exception as e:
        print(f"JSON Parse Error in skill_extractor: {e}")
        state["skills"] = {"error": "Failed to parse skills"}
        
    return state
