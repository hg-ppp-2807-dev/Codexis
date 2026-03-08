package services

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/codexis/backend/models"
)

// FetchRepoData fetches metadata from GitHub REST API
func FetchRepoData(repoURL string) (*models.RepoDataDTO, error) {
	// Parse URL (e.g., https://github.com/owner/name)
	parts := strings.Split(strings.TrimRight(repoURL, "/"), "/")
	if len(parts) < 2 {
		return nil, fmt.Errorf("invalid repository url")
	}
	owner := parts[len(parts)-2]
	name := parts[len(parts)-1]

	data := &models.RepoDataDTO{
		URL:           repoURL,
		Owner:         owner,
		Name:          name,
		Languages:     make(map[string]int),
		FileTree:      []string{},
		Dependencies:  []string{},
		RecentCommits: []string{},
	}

	// Helper to make API calls
	githubToken := os.Getenv("GITHUB_TOKEN")
	getGitHubData := func(endpoint string, result interface{}) error {
		url := fmt.Sprintf("https://api.github.com/repos/%s/%s%s", owner, name, endpoint)
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return err
		}
		if githubToken != "" && githubToken != "your_github_token_here_for_higher_rate_limits" {
			req.Header.Set("Authorization", "Bearer "+githubToken)
		}
		req.Header.Set("Accept", "application/vnd.github.v3+json")

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return err
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			return fmt.Errorf("github api error (%d): %s", resp.StatusCode, string(body))
		}

		return json.NewDecoder(resp.Body).Decode(result)
	}

	// 1. Languages
	var languages map[string]int
	if err := getGitHubData("/languages", &languages); err != nil {
		log.Printf("Failed to fetch languages: %v", err)
	} else {
		data.Languages = languages
	}

	// 2. Fetch basic file tree (default branch) via git trees api (non-recursive for now to save limits, or recursive if needed)
	// For simplicity, we fetch the default branch then its recursive tree
	type RepoInfo struct {
		DefaultBranch string `json:"default_branch"`
	}
	var rInfo RepoInfo
	if err := getGitHubData("", &rInfo); err == nil {
		type TreeResp struct {
			Tree []struct {
				Path string `json:"path"`
			} `json:"tree"`
		}
		var treeResp TreeResp
		if err := getGitHubData(fmt.Sprintf("/git/trees/%s?recursive=1", rInfo.DefaultBranch), &treeResp); err == nil {
			for _, item := range treeResp.Tree {
				data.FileTree = append(data.FileTree, item.Path)
				// Basic dependency detection based on filenames
				if strings.Contains(item.Path, "go.mod") || strings.Contains(item.Path, "package.json") || strings.Contains(item.Path, "requirements.txt") || strings.Contains(item.Path, "Cargo.toml") {
					data.Dependencies = append(data.Dependencies, item.Path)
				}
			}
		}
	}

	// 3. Fetch README (Attempt raw download or via API)
	// GitHub API provides base64 encoded readme, we'll decode it or use raw user content for simplicity.
	readmeURL := fmt.Sprintf("https://raw.githubusercontent.com/%s/%s/main/README.md", owner, name)
	resp, err := http.Get(readmeURL)
	if err == nil && resp.StatusCode == 200 {
		b, _ := io.ReadAll(resp.Body)
		data.Readme = string(b)
	} else {
		// Fallback to master
		readmeURL = fmt.Sprintf("https://raw.githubusercontent.com/%s/%s/master/README.md", owner, name)
		resp, err = http.Get(readmeURL)
		if err == nil && resp.StatusCode == 200 {
			b, _ := io.ReadAll(resp.Body)
			data.Readme = string(b)
		}
	}

	return data, nil
}
