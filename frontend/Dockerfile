# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage - serve with Node
FROM node:22-alpine

WORKDIR /app

# Install dumb-init and a simple static server
RUN apk add --no-cache dumb-init && npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Expose the port
EXPOSE 5173

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Serve the application
CMD ["serve", "-s", "dist", "-l", "5173"]
