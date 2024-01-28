# Use an official Node.js runtime as a base image
FROM node:14-alpine


#install Latex
RUN apk update && \
    apk add --no-cache wget  texmf-dist texlive 
    
RUN which pdflatex

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
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