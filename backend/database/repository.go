package database

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/codexis/backend/models"
)

// SaveRepository saves or updates a repository in the database
func SaveRepository(ctx context.Context, repo *models.Repository) error {
	query := `
		INSERT INTO repositories (url, owner, name, description, languages, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		ON CONFLICT (url) DO UPDATE SET 
			description = EXCLUDED.description,
			languages = EXCLUDED.languages
		RETURNING id
	`

	err := Pool.QueryRow(ctx, query,
		repo.URL,
		repo.Owner,
		repo.Name,
		repo.Description,
		repo.Languages,
	).Scan(&repo.ID)

	if err != nil {
		return fmt.Errorf("error saving repository: %w", err)
	}
	return nil
}

// SaveAnalysis saves a generated analysis report
func SaveAnalysis(ctx context.Context, analysis *models.AnalysisReport) error {
	query := `
		INSERT INTO analysis_reports (repo_id, summary, tech_stack, code_quality, architecture, skills, generated_readme, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
		RETURNING id
	`

	err := Pool.QueryRow(ctx, query,
		analysis.RepoID,
		analysis.Summary,
		analysis.TechStack,
		analysis.CodeQuality,
		analysis.Architecture,
		analysis.Skills,
		analysis.GeneratedReadme,
	).Scan(&analysis.ID)

	if err != nil {
		return fmt.Errorf("error saving analysis report: %w", err)
	}
	return nil
}

// GetAnalysis retrieves a full analysis by ID
func GetAnalysis(ctx context.Context, id string) (*models.AnalysisReport, error) {
	query := `
		SELECT id, repo_id, summary, tech_stack, code_quality, architecture, skills, generated_readme, created_at
		FROM analysis_reports
		WHERE id = $1
	`

	var a models.AnalysisReport
	var techStack, codeQuality, arch, skills []byte

	err := Pool.QueryRow(ctx, query, id).Scan(
		&a.ID,
		&a.RepoID,
		&a.Summary,
		&techStack,
		&codeQuality,
		&arch,
		&skills,
		&a.GeneratedReadme,
		&a.CreatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("error getting analysis report: %w", err)
	}

	a.TechStack = json.RawMessage(techStack)
	a.CodeQuality = json.RawMessage(codeQuality)
	a.Architecture = json.RawMessage(arch)
	a.Skills = json.RawMessage(skills)

	return &a, nil
}
