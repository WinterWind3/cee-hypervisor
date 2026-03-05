# Simple Node.js React frontend image for CEE Hypervisor
FROM node:18-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend source
COPY . .

# Expose React dev server port
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]
