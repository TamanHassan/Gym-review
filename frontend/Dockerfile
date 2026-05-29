# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

ARG VITE_API_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

# Build the app
RUN VITE_API_URL=${VITE_API_URL} \
	VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY} \
	VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN} \
	VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID} \
	VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET} \
	VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID} \
	VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID} \
	npm run build

# Production stage - serve with Node
FROM node:22-alpine

WORKDIR /app

# Install dumb-init, wget, and a simple static server
RUN apk add --no-cache dumb-init wget && npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Expose the port
EXPOSE 5173

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Serve the application
CMD ["serve", "-s", "dist", "-l", "5173"]
