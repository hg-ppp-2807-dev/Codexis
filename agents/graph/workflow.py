from langgraph.graph import StateGraph, END
from graph.state import GraphState

# Import agents
from agents.repo_analyzer import repo_analyzer
from agents.stack_detector import stack_detector
from agents.code_quality import code_quality
from agents.architecture import architecture
from agents.skill_extractor import skill_extractor
from agents.readme_generator import readme_generator

async def run_analysis_workflow(repo_data: dict) -> dict:
    """
    Builds and executes the LangGraph workflow.
    repo_data -> stack_detection -> code_quality -> architecture -> skill_extraction -> readme_generation
    """
    workflow = StateGraph(GraphState)

    # Add Nodes
    workflow.add_node("repo_analyzer", repo_analyzer)
    workflow.add_node("stack_detector", stack_detector)
    workflow.add_node("code_quality", code_quality)
    workflow.add_node("architecture", architecture)
    workflow.add_node("skill_extractor", skill_extractor)
    workflow.add_node("readme_generator", readme_generator)

    # Build Edges (Linear sequential pipeline for now to ensure context passes properly)
    workflow.set_entry_point("repo_analyzer")
    workflow.add_edge("repo_analyzer", "stack_detector")
    workflow.add_edge("stack_detector", "code_quality")
    workflow.add_edge("code_quality", "architecture")
    workflow.add_edge("architecture", "skill_extractor")
    workflow.add_edge("skill_extractor", "readme_generator")
    workflow.add_edge("readme_generator", END)

    # Compile and execute
    app = workflow.compile()
    
    # Initial state
    inputs = {
        "repo_data": repo_data,
        "summary": "",
        "tech_stack": {},
        "code_quality": {},
        "architecture": {},
        "skills": {},
        "generated_readme": ""
    }

    result = await app.ainvoke(inputs)

    # Format the final output to match Go expected model
    return {
        "repo_id": "", # Added in Go
        "summary": result.get("summary", ""),
        "tech_stack": result.get("tech_stack", {}),
        "code_quality": result.get("code_quality", {}),
        "architecture": result.get("architecture", {}),
        "skills": result.get("skills", {}),
        "generated_readme": result.get("generated_readme", "")
    }

