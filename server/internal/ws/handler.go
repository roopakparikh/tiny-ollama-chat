package ws

import (
	"bufio"
	"encoding/json"
	"log"
	"net/http"
	"ollama-tiny-chat/server/internal/database"
	"ollama-tiny-chat/server/internal/ollama"
	"strings"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	conn           *websocket.Conn
	currentConvoID string
}

type WSRequest struct {
	Type    string `json:"type"` // "message", "start_conversation"
	Message string `json:"message"`
	Model   string `json:"model"`
	ConvoID string `json:"convo_id,omitempty"`
}

type WSResponse struct {
	Type    string `json:"type"` // "thinking", "response", "error"
	Content string `json:"content"`
}

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {

	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		http.Error(w, "Could not upgrade connection", http.StatusInternalServerError)
		return
	}

	defer conn.Close()

	client := &Client{
		conn:           conn,
		currentConvoID: "",
	}

	for {
		var req WSRequest
		if err := conn.ReadJSON(&req); err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				println("error reading websocket message:", err)
			}
			break
		}

		switch req.Type {
		case "start_conversation":
			handleNewConversation(client, req)
		case "message":
			handleMessage(client, req)
		}
	}
}

func handleNewConversation(client *Client, req WSRequest) {
	convoID, err := database.CreateConversation(req.Message, req.Model)

	if err != nil {
		sendError(client, "Failed to create conversation")
		return
	}
	client.currentConvoID = convoID

	if err := database.AddMessage(convoID, "user", req.Message); err != nil {
		sendError(client, "Failed to save message")
		return
	}

	client.conn.WriteJSON(WSResponse{
		Type:    "conversation_started",
		Content: convoID,
	})

	generateResponse(client, req)
}

func handleMessage(client *Client, req WSRequest) {
	if client.currentConvoID == "" {
		sendError(client, "No active conversation")
		return
	}

	if err := database.AddMessage(client.currentConvoID, "user", req.Message); err != nil {
		sendError(client, "Failed to save message")
		return
	}

	generateResponse(client, req)

}

func generateResponse(client *Client, req WSRequest) {
	ollamaClient := ollama.NewClient("")

	resp, err := ollamaClient.GenerateStream(req.Model, req.Message)
	if err != nil {
		sendError(client, "Failed to generate response")
		return
	}

	defer resp.Body.Close()

	scanner := bufio.NewScanner(resp.Body)
	var fullResponse strings.Builder
	var thinking strings.Builder
	isThinking := false

	messageCount := 0

	for scanner.Scan() {
		messageCount++
		var genResp ollama.GenerateResponse
		if err := json.Unmarshal(scanner.Bytes(), &genResp); err != nil {
			log.Printf("Error unmarshaling response: %v", err)
			continue
		}

		if genResp.Done {

			finalResponse := fullResponse.String()
			if finalResponse != "" {
				err := database.AddMessageWithThinking(
					client.currentConvoID,
					"assistant",
					finalResponse,
					finalResponse,
					pointer(thinking.String()),
					nil,
				)
				if err != nil {
					log.Printf("Error saving response: %v", err)
					sendError(client, "Failed to save response")
				}
			}
			break
		}

		// Look for thinking tags
		if strings.Contains(genResp.Response, "<think>") {
			isThinking = true
			continue
		}
		if strings.Contains(genResp.Response, "</think>") {
			isThinking = false
			// Send thinking content
			client.conn.WriteJSON(WSResponse{
				Type:    "thinking",
				Content: thinking.String(),
			})
			thinking.Reset()
			continue
		}

		if isThinking {
			thinking.WriteString(genResp.Response)
		} else {
			fullResponse.WriteString(genResp.Response)
			client.conn.WriteJSON(WSResponse{
				Type:    "response_chunk",
				Content: genResp.Response,
			})
		}

	}

	if err := database.AddMessageWithThinking(
		client.currentConvoID,
		"assistant",
		fullResponse.String(),
		fullResponse.String(),
		pointer(thinking.String()),
		nil,
	); err != nil {
		sendError(client, "Failed to save response")
		return
	}

	// Signal completion
	client.conn.WriteJSON(WSResponse{
		Type:    "done",
		Content: "",
	})

}

func pointer(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func sendError(client *Client, message string) {
	client.conn.WriteJSON(WSResponse{
		Type:    "error",
		Content: message,
	})

}
