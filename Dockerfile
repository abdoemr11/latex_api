# Use an official Node.js runtime as a base image
FROM node:14-alpine
    
RUN apk update && \
    apk add --no-cache wget perl fontconfig-dev xz tar && \
    mkdir /tmp/install-tl && \
    wget -qO- https://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz | tar -xz -C /tmp/install-tl --strip-components=1 && \
    printf "%s\n" \
        "selected_scheme scheme-basic" \
        "TEXDIR /usr/local/texlive" \
        "TEXMFLOCAL /usr/local/texlive/texmf-local" \
        "TEXMFSYSCONFIG /usr/local/texlive/texmf-config" \
        "TEXMFSYSVAR /usr/local/texlive/texmf-var" \
        "option_doc 0" \
        "option_src 0" \
        > /tmp/install-tl/texlive.profile && \
        
    /tmp/install-tl/install-tl --profile=/tmp/install-tl/texlive.profile

ENV PATH="${PATH}:/usr/local/texlive/bin/x86_64-linuxmusl"

RUN tlmgr install preprint
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