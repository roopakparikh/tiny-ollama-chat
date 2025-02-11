package main

import (
	"fmt"
	"log"
	"ollama-tiny-chat/server/internal/ollama"
)

func main() {
	client := ollama.NewClient("")

	models, err := client.ListModels()

	if err != nil {
		log.Fatal("Error getting models:", err)
	}

	fmt.Println("Available Models:")
	for _, model := range models {
		fmt.Printf("- %s (Model: %s, Size: %s)\n",
			model.Name,
			model.Model,
			model.Details.ParameterSize,
		)
	}
}
