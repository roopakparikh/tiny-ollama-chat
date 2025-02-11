package main

import (
	"fmt"
	"log"
	"net/http"

	"ollama-tiny-chat/server/internal/api"
	"ollama-tiny-chat/server/internal/database"

	"github.com/gorilla/mux"
)

func main() {
	if err := database.InitDB(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	r := mux.NewRouter()

	apiRouter := r.PathPrefix("/api").Subrouter()

	api.RegisterRoutes(apiRouter)

	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./static")))

	fmt.Println("Server starting on :8080...")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
