# Use a stable Node.js version
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Using 'npm ci' is better for production as it's faster and more reliable
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port your server runs on (usually 5000 based on your previous logs)
EXPOSE 5000

# Command to run the application
CMD ["node", "server.js"]
