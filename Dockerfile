# Multi-stage Docker build for NestJS production

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Graceful shutdown support in NestJS
CMD ["node", "dist/main"]
