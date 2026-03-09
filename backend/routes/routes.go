package routes

import (
	"github.com/codexis/backend/controllers"
	"github.com/go-chi/chi/v5"
)

func RegisterRoutes(r chi.Router) {
	r.Route("/api", func(r chi.Router) {
		r.Post("/analyze-repo", controllers.AnalyzeRepoHandler)
		r.Get("/analysis/{id}", controllers.GetAnalysisHandler)
	})

	// Feature routes
	r.Post("/api/features/architecture", controllers.GenerateArchitecture)
	r.Post("/api/features/health-score", controllers.GetHealthScore)
	r.Post("/api/features/pr-review", controllers.ReviewPR)
	r.Post("/api/features/skills", controllers.GetSkillGraph)
	r.Post("/api/features/refactor", controllers.GetRefactorSuggestions)
}
