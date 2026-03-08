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

def repo_analyzer(state: GraphState) -> GraphState:
    """Agent 1: Summarizes the repository based on basic metadata and README."""
    repo_data = state["repo_data"]
    llm = _get_llm()

    prompt = f"""
    You are an expert AI repository analyzer. 
    Review the following GitHub repository and create a concise but comprehensive summary (max 3 paragraphs).
    
    Repository Name: {repo_data.get('owner')}/{repo_data.get('name')}
    Languages: {json.dumps(repo_data.get('languages', {}))}
    Dependencies: {json.dumps(repo_data.get('dependencies', []))}
    
    README Extract:
    {repo_data.get('readme', '')[:3000]} # Truncated to avoid massive prompt for summary
    
    Provide only the summary string, nothing else.
    """

    response = llm.invoke(prompt)
    state["summary"] = response.content.strip()
    return state
