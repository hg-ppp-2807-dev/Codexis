package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

// agentURL returns the Python agent base URL from env or default
func agentURL() string {
	url := os.Getenv("AGENT_SERVICE_URL")
	if url == "" {
		url = "http://localhost:8000"
	}
	return url
}

// proxyToAgent forwards the request body to the agent service and returns the response
func proxyToAgent(w http.ResponseWriter, r *http.Request, path string) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, `{"error":"failed to read request body"}`, http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	targetURL := fmt.Sprintf("%s%s", agentURL(), path)
	req, err := http.NewRequest(http.MethodPost, targetURL, bytes.NewBuffer(body))
	if err != nil {
		http.Error(w, `{"error":"failed to create request"}`, http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"agent service unavailable: %s"}`, err.Error()), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, `{"error":"failed to read agent response"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(respBody)
}

// ── Feature 1: Architecture Diagram ──────────────────────────────────────────

// GenerateArchitecture proxies to the Python architecture agent
func GenerateArchitecture(w http.ResponseWriter, r *http.Request) {
	proxyToAgent(w, r, "/api/features/architecture")
}

// ── Feature 2: Health Score ───────────────────────────────────────────────────

// GetHealthScore proxies to the Python health score agent
func GetHealthScore(w http.ResponseWriter, r *http.Request) {
	proxyToAgent(w, r, "/api/features/health-score")
}

// ── Feature 3: PR Review ──────────────────────────────────────────────────────

// ReviewPR proxies to the Python PR review agent
func ReviewPR(w http.ResponseWriter, r *http.Request) {
	proxyToAgent(w, r, "/api/features/pr-review")
}

// ── Feature 4: Skill Graph ────────────────────────────────────────────────────

// GetSkillGraph proxies to the Python skill graph agent
func GetSkillGraph(w http.ResponseWriter, r *http.Request) {
	proxyToAgent(w, r, "/api/features/skills")
}

// ── Feature 5: Refactor Suggestions ──────────────────────────────────────────

// GetRefactorSuggestions proxies to the Python refactor agent
func GetRefactorSuggestions(w http.ResponseWriter, r *http.Request) {
	proxyToAgent(w, r, "/api/features/refactor")
}

// ── Response helpers ──────────────────────────────────────────────────────────

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}