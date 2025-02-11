package ollama

import (
	"encoding/json"
	"fmt"
	"net/http"
)

const (
	defaultBaseUrl = "http://localhost:11434"
	modelListPath  = "/api/tags"
)

type Client struct {
	baseURL    string
	httpClient *http.Client
}

type ModelDetails struct {
	ParameterSize string `json:"parameter_size"`
}

type ModelInfo struct {
	Name    string       `json:"name"`
	Model   string       `json:"model"`
	Details ModelDetails `json:"details"`
}

type ListModelResponse struct {
	Models []ModelInfo `json:"models"`
}

func NewClient(baseURL string) *Client {
	if baseURL == "" {
		baseURL = defaultBaseUrl
	}

	return &Client{
		baseURL:    baseURL,
		httpClient: &http.Client{},
	}
}

func (c *Client) ListModels() ([]ModelInfo, error) {
	resp, err := c.httpClient.Get(c.baseURL + modelListPath)

	if err != nil {
		return nil, fmt.Errorf("failed to get models: %w", err)
	}

	defer resp.Body.Close()

	var response ListModelResponse

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return response.Models, nil
}
