#!/bin/bash
set -e

echo "🚀 Building Tiny Ollama Chat..."

# Create or clear build directory
if [ -d "build" ]; then
    echo "🧹 Clearing previous build..."
    rm -rf build/*
else
    echo "📁 Creating build directory..."
    mkdir -p build
fi

# Build client
echo "📦 Building client..."
cd client
npm install
npm run build
cd ..

# Copy client build to build/static
echo "📂 Copying client build to build/static..."
mkdir -p build/static
cp -r client/dist/* build/static/

# Build server
echo "📦 Building server..."
cd server
go mod download
go build -o ../build/tiny-ollama-chat ./cmd/server/main.go
cd ..

echo "✅ Build complete!"
echo ""
echo "📋 To run the application:"
echo "   cd build"
echo "   ./tiny-ollama-chat"
echo ""
echo "🔧 Optional flags:"
echo "   -port=8080              Set server port (default: 8080)"
echo "   -ollama-url=URL         Set Ollama API URL (default: http://localhost:11434)"
echo "   -db-path=PATH           Set database path (default: chat.db)"
echo ""
echo "📝 Example:"
echo "   ./tiny-ollama-chat -port=9000 -ollama-url=http://192.168.1.100:11434"