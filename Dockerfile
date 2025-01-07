# Use the official Node.js 20 Alpine image as the base
FROM node:20-alpine

# Install build dependencies and ODBC libraries
RUN apk add --no-cache python3 make g++ gcc libc-dev unixodbc-dev

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install dependencies with frozen lockfile to ensure consistency
RUN npm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose port 3000 to the host
EXPOSE 3000

# Use JSON array syntax for CMD to handle OS signals properly
CMD ["npm", "run", "dev"]
