# Build and test stage
FROM node:18-alpine AS build

# Install dependencies required for bcrypt
RUN apk add --no-cache make gcc g++ python3

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy rest of the files
COPY . .

# Create test directory if it doesn't exist
RUN mkdir -p ./tests

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy only necessary files from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/*.js ./
COPY --from=build /app/frontend ./frontend
COPY --from=build /app/public ./public

# Expose port
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]

# Test stage - separate from production
FROM build AS test

# Run tests
CMD ["npm", "test"]