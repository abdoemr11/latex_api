# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./



# Install TinyTeX
RUN apt-get update && apt-get install -y wget
# Install TinyTeX and capture the output
RUN wget -qO- "https://yihui.org/tinytex/install-bin-unix.sh" | sh > installation_log.txt

# Print the content of the installation log (you can modify or redirect the output as needed)
RUN cat installation_log.txt
RUN /root/.TinyTeX/bin/*/tlmgr install collection-basic
RUN ls /root/.TinyTeX/bin/*/
# Check if pdflatex is installed
RUN PATH=$PATH:/root/.TinyTeX/bin/*/
RUN command -v pdflatex >/dev/null 2>&1 || { echo >&2 "pdflatex is not installed. Aborting."; exit 1; }

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
