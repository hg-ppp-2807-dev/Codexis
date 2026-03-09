"""Shared LLM utility for all agents - uses Ollama (free local LLM)"""
from langchain_ollama import ChatOllama

def get_llm():
    """Returns the shared Ollama LLM instance."""
    return ChatOllama(
        model="llama3.2:latest",
        temperature=0.1
    )