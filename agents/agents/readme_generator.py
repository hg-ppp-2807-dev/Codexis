import os
from langchain_mistralai import ChatMistralAI
from graph.state import GraphState

def _get_llm():
    return ChatMistralAI(
        model="mistral-large-latest",
        temperature=0.4,
        mistral_api_key=os.getenv("MISTRAL_API_KEY")
    )

def readme_generator(state: GraphState) -> GraphState:
    """Agent 6: Generates a high-quality Markdown README based on all previous analyses."""
    repo_data = state.get("repo_data", {})
    if repo_data.get("has_existing_readme"):
        state["generated_readme"] = ""
        return state

    tech_stack = state.get("tech_stack", {})
    architecture = state.get("architecture", {})

    llm = _get_llm()

    prompt = f"""
    You are an expert Developer Advocate and Technical Writer.
    Write a pristine, professional README.md for the following repository.

    Repo Name: {repo_data.get('name')}
    Owner: {repo_data.get('owner')}
    Tech Stack: {tech_stack} 
    Architecture/Patterns: {architecture}
    
    The README should include:
    1. A catchy title and short description.
    2. Architecture Overview based on the provided patterns.
    3. Tech Stack section.
    4. Getting started (infer based on the stack, e.g., 'npm install' or 'go run main.go').
    
    Make it look beautiful using markdown badges if possible, but keep the raw markdown valid.
    Only return the markdown string itself.
    """

    response = llm.invoke(prompt)
    content = response.content.strip()
    if content.startswith("```markdown"):
        content = content[11:-3].strip()
    elif content.startswith("```"):
        content = content[3:-3].strip()
        
    state["generated_readme"] = content
    return state
