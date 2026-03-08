package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/codexis/backend/database"
	"github.com/codexis/backend/models"
	"github.com/codexis/backend/services"
	"github.com/go-chi/chi/v5"
)

func AnalyzeRepoHandler(w http.ResponseWriter, r *http.Request) {
	var req models.AnalyzeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if req.RepoURL == "" {
		http.Error(w, "repo_url is required", http.StatusBadRequest)
		return
	}

	// 1. Fetch data from GitHub
	repoData, err := services.FetchRepoData(req.RepoURL)
	if err != nil {
		http.Error(w, "Failed to fetch GitHub data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 2. Save/Update Repo in DB
	repoModel := &models.Repository{
		URL:       repoData.URL,
		Owner:     repoData.Owner,
		Name:      repoData.Name,
		Languages: marshalLanguages(repoData.Languages),
	}
	if err := database.SaveRepository(r.Context(), repoModel); err != nil {
		// Log but continue
	}

	// 3. Orchestrate AI Analysis
	analysisReport, err := services.OrchestrateAnalysis(repoData)
	if err != nil {
		http.Error(w, "AI Analysis failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 4. Save Analysis Report to DB
	analysisReport.RepoID = repoModel.ID
	if err := database.SaveAnalysis(r.Context(), analysisReport); err != nil {
		// Log but continue
	}

	// 5. Respond with the report
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analysisReport)
}

func GetAnalysisHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "id is required", http.StatusBadRequest)
		return
	}

	report, err := database.GetAnalysis(r.Context(), id)
	if err != nil {
		http.Error(w, "Analysis not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(report)
}

// Helper
func marshalLanguages(v map[string]int) []byte {
	b, _ := json.Marshal(v)
	if string(b) == "null" {
		return []byte("{}")
	}
	return b
}
