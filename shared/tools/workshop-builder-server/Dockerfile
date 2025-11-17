# Use official Node.js LTS image
FROM node:20-alpine

# Install git
RUN apk add --no-cache git

# Configure git to trust the /repo directory
RUN git config --global --add safe.directory /repo

# Configure git user identity (required for commits)
RUN git config --global user.name "Workshop Builder"
RUN git config --global user.email "workshop-builder@redis.com"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY *.js ./

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start the server
CMD ["node", "server.js"]
