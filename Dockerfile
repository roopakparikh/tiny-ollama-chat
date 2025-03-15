FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache gcc musl-dev git

# Create app directory
WORKDIR /build

# Copy server code
COPY server/ ./server/

# Set the working directory to the server directory
WORKDIR /build/server

# Download dependencies
RUN go mod download

# Build the binary
RUN CGO_ENABLED=1 go build -o tiny-ollama-chat ./cmd/server/main.go

# Final image
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Create app directory structure - set it ONCE
WORKDIR /app
RUN mkdir -p static data

# Copy the binary from the builder stage
COPY --from=builder /build/server/tiny-ollama-chat ./

# Copy the static directory if it exists in the source
COPY server/static/ ./static/

# Environment variables for configuration
ENV PORT=8080
ENV OLLAMA_URL=http://host.docker.internal:11434
ENV DB_PATH=/app/data/chat.db

# Expose the port
EXPOSE 8080

# Create volume for persistent data
VOLUME ["/app/data"]

# Create entrypoint script that properly uses environment variables
RUN echo '#!/bin/sh\n\
exec ./tiny-ollama-chat -port=$PORT -ollama-url=$OLLAMA_URL -db-path=$DB_PATH "$@"' > ./entrypoint.sh && \
chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]