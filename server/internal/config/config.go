package config

import (
	"flag"
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"sync"
)

// Config holds the application configuration
type Config struct {
	// Server configuration
	ServerPort int

	// Ollama configuration
	OllamaURL string
}

// Default configuration values
const (
	DefaultServerPort = 8080
	DefaultOllamaURL  = "http://localhost:11434"
)

var (
	instance *Config
	once     sync.Once
)

// Get returns the singleton instance of the configuration
func Get() *Config {
	once.Do(func() {
		instance = &Config{
			ServerPort: DefaultServerPort,
			OllamaURL:  DefaultOllamaURL,
		}
	})
	return instance
}

// ParseFlags parses command line flags and updates the config
func ParseFlags() {
	cfg := Get()

	// Define command line flags
	serverPort := flag.Int("port", DefaultServerPort, "Port for the server to listen on")
	ollamaURL := flag.String("ollama-url", DefaultOllamaURL, "URL for the Ollama API")

	// Parse flags
	flag.Parse()

	// Apply parsed values
	cfg.ServerPort = *serverPort
	cfg.OllamaURL = *ollamaURL

	// Validate and normalize the URL
	if !strings.HasPrefix(cfg.OllamaURL, "http://") && !strings.HasPrefix(cfg.OllamaURL, "https://") {
		cfg.OllamaURL = "http://" + cfg.OllamaURL
	}
}

// Validate checks if the configuration is valid
func Validate() error {
	cfg := Get()

	// Validate port
	if cfg.ServerPort < 1 || cfg.ServerPort > 65535 {
		return fmt.Errorf("invalid port number: %d (must be between 1 and 65535)", cfg.ServerPort)
	}

	// Validate Ollama URL
	parsedURL, err := url.Parse(cfg.OllamaURL)
	if err != nil {
		return fmt.Errorf("invalid Ollama URL: %w", err)
	}
	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return fmt.Errorf("unsupported URL scheme: %s (must be http or https)", parsedURL.Scheme)
	}

	return nil
}

// GetServerAddress returns the address for the HTTP server to listen on
func GetServerAddress() string {
	return ":" + strconv.Itoa(Get().ServerPort)
}

// String returns a string representation of the configuration
func String() string {
	cfg := Get()
	return fmt.Sprintf("Server port: %d, Ollama URL: %s", cfg.ServerPort, cfg.OllamaURL)
}
