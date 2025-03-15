# Stage 1: Build the application
FROM golang:1.23-alpine AS builder

# Install build dependencies
RUN apk add --no-cache gcc musl-dev git ca-certificates

# Set working directory
WORKDIR /build

# Copy go.mod and go.sum first to leverage Docker cache
COPY server/go.* ./
RUN go mod download

# Copy the rest of the source code
COPY server/ ./

# Build the binary
RUN CGO_ENABLED=1 go build -ldflags="-s -w" -o tiny-ollama-chat ./cmd/server/main.go

# Stage 2: Create the runtime image
FROM alpine:latest

# Install runtime dependencies and ca-certificates for HTTPS connections
RUN apk --no-cache add ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /build/tiny-ollama-chat .

# Copy any static files if needed
COPY --from=builder /build/static ./static

# Copy entrypoint script
COPY entrypoint.sh .

# Make script executable
RUN chmod +x entrypoint.sh

# Create data directory
RUN mkdir -p data

# Environment variables with defaults
ENV PORT=8080 \
    OLLAMA_URL="http://172.17.0.1:11434" \
    DB_PATH="/app/data/chat.db"

# Expose the port (using the environment variable)
EXPOSE ${PORT}

# Create volume for persistent data
VOLUME ["/app/data"]

# Use the binary as the entrypoint, using environment variables for configuration
ENTRYPOINT ["./entrypoint.sh"]