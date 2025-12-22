# Dockerfile for Node.js backend
FROM node:20-alpine

WORKDIR /app


# Copy package files and install all dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm install


# Copy all source code
COPY . .

# Build TypeScript
RUN npm run build


# Expose backend port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
