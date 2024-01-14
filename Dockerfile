# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./



RUN apt-get update && apt-get install -y wget

#install texlive no tiny tex
RUN apt-get install texlive-latex-extra -y
RUN which pdflatex


# Install app dependencies
RUN npm install
# Bundle your app source
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]
