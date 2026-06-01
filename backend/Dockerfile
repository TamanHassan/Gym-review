# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for Prisma)
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Final stage
FROM node:22-alpine

WORKDIR /app

# Install dumb-init and wget for compose healthchecks
RUN apk add --no-cache dumb-init wget

# Copy node_modules and app from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY . .

# Remove firebase-key.json if it exists (shouldn't be here, but just in case)
RUN rm -f firebase-key.json .env

# Expose the port
EXPOSE 3000

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Run Prisma migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
