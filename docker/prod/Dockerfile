# Use the official node.js image as our base
FROM node:24-alpine as builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to Leverage Docker cache
COPY package*.json ./

# Install exact versionn of app dependencies
RUN npm ci

# Copy the rest of our app's source code into the container
COPY . .

# Build the project
RUN npm run build

FROM node:24-alpine as production

# Set node env production
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to Leverage Docker cache
COPY package*.json ./

# Install exact versionn of app dependencies
RUN npm ci --ignore-scripts

# Copy the dist of our app's source code into the container
COPY --from=builder /app/dist ./

# Expose PORT
EXPOSE 5500

# The command to run our app
CMD ["node", "server.js"]