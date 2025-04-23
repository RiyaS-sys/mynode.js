# Use a base image
FROM node:alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the files
COPY . .

# Expose port (if your app runs on 3000)
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]
