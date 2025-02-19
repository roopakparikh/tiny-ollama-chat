# 🤖 Tiny Ollama Chat

A super small lightweight UI for accessing Ollama models. Just a working version now, will make some improvements in future.

## ✨ Features

- 📱 Real-time message streaming
- 🧠 View AI thinking process
- 💬 Conversation history
- 🚀 Multiple model support

## 🚦 Getting Started

### Prerequisites
- Node.js
- Go
- Ollama running locally

### 🏃‍♂️ Installing

1. Clone the repository
```bash
git clone https://github.com/yourusername/tiny-ollama-chat.git
cd tiny-ollama-chat
```

2. Set up the frontend
```bash
cd client
npm install
npm run build
```

3.Set up the backend
```bash
cd ../server
go mod download
```

### 🏃‍♂️ Running the Application
```bash
go run cmd/server/main.go
```

The application will be available at http://localhost:8080

## 📖 Usage

1. Select a model to start a new conversation
2. Type your message and send
3. Browse previous conversations in the sidebar

## 🔮 Coming Soon
- 🔗 Custom Ollama URL support
- 💾 Support for multiple databases

## 💡 Why Tiny Ollama?

Sometimes simpler is better! This minimal interface focuses on what matters most - having great conversations with AI without the bloat.
