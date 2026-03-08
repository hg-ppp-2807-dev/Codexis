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
}
