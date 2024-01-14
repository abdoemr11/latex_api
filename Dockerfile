# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Install TinyTeX
RUN apt-get update && apt-get install -y wget
RUN wget -qO- "https://yihui.org/tinytex/install-bin-unix.sh" | sh
RUN /root/.TinyTeX/bin/*/tlmgr install collection-basic

# Bundle your app source
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]
