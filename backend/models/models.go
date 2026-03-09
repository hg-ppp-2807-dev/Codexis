package models

import (
	"encoding/json"
	"time"
)

// DB Models
type Repository struct {
	ID          string          `json:"id"`
	URL         string          `json:"url"`
	Owner       string          `json:"owner"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Languages   json.RawMessage `json:"languages"`
	CreatedAt   time.Time       `json:"created_at"`
}

type AnalysisReport struct {
	ID                string          `json:"id"`
	RepoID            string          `json:"repo_id"`
	Summary           string          `json:"summary"`
	TechStack         json.RawMessage `json:"tech_stack"`
	CodeQuality       json.RawMessage `json:"code_quality"`
	Architecture      json.RawMessage `json:"architecture"`
	Skills            json.RawMessage `json:"skills"`
	GeneratedReadme   string          `json:"generated_readme"`
	HasExistingReadme bool            `json:"has_existing_readme"`
	CreatedAt         time.Time       `json:"created_at"`
}

// Request Models
type AnalyzeRequest struct {
	RepoURL string `json:"repo_url"`
}

// Data Transfer Objects (DTO) passed to AI Agents
type RepoDataDTO struct {
	URL               string            `json:"url"`
	Owner             string            `json:"owner"`
	Name              string            `json:"name"`
	Languages         map[string]int    `json:"languages"`
	FileTree          []string          `json:"file_tree"`
	Dependencies      map[string]string `json:"dependencies"` // Scanned file contents (package.json, go.mod, etc.)
	Readme            string            `json:"readme"`
	HasExistingReadme bool              `json:"has_existing_readme"`
	RecentCommits     []string          `json:"recent_commits"`
}
