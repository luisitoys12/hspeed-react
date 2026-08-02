# Dockerfile for hspeed-react (cpanel-deploy)
FROM node:20-alpine

# Create app directory
WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies
COPY package*.json ./
RUN npm ci --production --no-audit --no-fund

# Copy app bundle and static assets
COPY . .

EXPOSE 5000

# Use PORT env var if provided, otherwise defaults in code to 5000
CMD ["node", "index.cjs"]
