package services

import (
	"encoding/base64"
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
	// Parse URL (e.g., https://github.com/owner/name or https://github.com/owner/name.git)
	// Remove .git suffix if present
	cleanURL := strings.TrimSuffix(repoURL, ".git")
	parts := strings.Split(strings.TrimRight(cleanURL, "/"), "/")
	if len(parts) < 2 {
		return nil, fmt.Errorf("invalid repository url")
	}
	owner := parts[len(parts)-2]
	name := parts[len(parts)-1]
	
	// Validate owner and name are not empty or contain invalid chars
	if owner == "" || name == "" || strings.Contains(owner, " ") || strings.Contains(name, " ") {
		return nil, fmt.Errorf("invalid repository url: could not parse owner/name")
	}

	data := &models.RepoDataDTO{
		URL:           repoURL,
		Owner:         owner,
		Name:          name,
		Languages:     make(map[string]int),
		FileTree:      []string{},
		Dependencies:  make(map[string]string),
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

	// 2. Fetch basic file tree (default branch) via git trees api (recursive)
	type RepoInfo struct {
		DefaultBranch string `json:"default_branch"`
	}
	var rInfo RepoInfo
	if err := getGitHubData("", &rInfo); err == nil {
		type TreeResp struct {
			Tree []struct {
				Path string `json:"path"`
				Type string `json:"type"`
			} `json:"tree"`
		}
		var treeResp TreeResp
		if err := getGitHubData(fmt.Sprintf("/git/trees/%s?recursive=1", rInfo.DefaultBranch), &treeResp); err == nil {
			targetDeps := []string{"go.mod", "package.json", "requirements.txt", "Cargo.toml", "pyproject.toml", "pom.xml", "docker-compose.yml", "docker-compose.yaml"}

			for _, item := range treeResp.Tree {
				if item.Type == "blob" {
					data.FileTree = append(data.FileTree, item.Path)
				}

				// Basic dependency detection based on exact filenames matching target dependencies
				parts := strings.Split(item.Path, "/")
				filename := parts[len(parts)-1]

				isDep := false
				for _, d := range targetDeps {
					if filename == d {
						isDep = true
						break
					}
				}

				// If it's a dependency file, fetch its physical content
				if isDep && len(data.Dependencies) < 10 { // Limit to 10 dependency files to avoid rate limits
					type FileContent struct {
						Content  string `json:"content"`
						Encoding string `json:"encoding"`
					}
					var fContent FileContent
					err := getGitHubData(fmt.Sprintf("/contents/%s", item.Path), &fContent)
					if err == nil && fContent.Encoding == "base64" {
						decoded, err := base64.StdEncoding.DecodeString(strings.ReplaceAll(fContent.Content, "\n", ""))
						if err == nil {
							data.Dependencies[item.Path] = string(decoded)
						} else {
							data.Dependencies[item.Path] = "error decoding"
						}
					}
				}
			}
		}
	}

	// 3. Fetch README (Attempt raw download or via API)
	readmeURL := fmt.Sprintf("https://raw.githubusercontent.com/%s/%s/main/README.md", owner, name)
	resp, err := http.Get(readmeURL)
	if err == nil && resp.StatusCode == 200 {
		b, _ := io.ReadAll(resp.Body)
		data.Readme = string(b)
		data.HasExistingReadme = true
	} else {
		// Fallback to master
		readmeURL = fmt.Sprintf("https://raw.githubusercontent.com/%s/%s/master/README.md", owner, name)
		resp, err = http.Get(readmeURL)
		if err == nil && resp.StatusCode == 200 {
			b, _ := io.ReadAll(resp.Body)
			data.Readme = string(b)
			data.HasExistingReadme = true
		} else {
			data.HasExistingReadme = false
		}
	}

	return data, nil
}
