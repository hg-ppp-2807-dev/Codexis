package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/codexis/backend/models"
)

// OrchestrateAnalysis sends the collected data to the Python AI agents and returns the parsed result.
func OrchestrateAnalysis(data *models.RepoDataDTO) (*models.AnalysisReport, error) {
	agentURL := os.Getenv("AGENT_SERVICE_URL")
	if agentURL == "" {
		agentURL = "http://localhost:8000"
	}

	payloadBytes, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal repo data: %w", err)
	}

	req, err := http.NewRequest("POST", agentURL+"/analyze", bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to reach agent service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("agent service error (%d): %s", resp.StatusCode, string(body))
	}

	var report models.AnalysisReport
	if err := json.NewDecoder(resp.Body).Decode(&report); err != nil {
		return nil, fmt.Errorf("failed to decode agent response: %w", err)
	}

	return &report, nil
}
