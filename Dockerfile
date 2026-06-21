# Use the official lightweight Node.js 18 image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to cache npm install
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the rest of the application files
COPY . .

# Cloud Run defaults to exposing port 8080.
# We respect the PORT environment variable provided by GCP.
ENV PORT=8080
EXPOSE 8080

# Run the app
CMD [ "node", "gateway.js" ]
