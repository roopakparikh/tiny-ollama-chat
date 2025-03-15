#Stage 1 build the client app
FROM node:20-alpine as frontend
WORKDIR /app/client
COPY client/package*.json  ./
RUN npm install
COPY client .
RUN npm run build


#Stage 2 build the server app
FROM golang:1.21-alpine as backend
WORKDIR /app/server
COPY server/go.mod .
COPY server/go.sum .
RUN go mod download
