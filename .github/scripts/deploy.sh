#!/bin/bash

mkdir -p ~/roomey-api

# Navigate to the project directory
cd ~/roomey-api

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "npm could not be found, installing nvm, Node.js, and npm"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    source ~/.bashrc
    nvm install 20
    nvm use 20
fi

git remote set-url origin https://github.com/alexindevs/roomey-api.git

# Pull the latest changes from the main branch
git pull origin main

# Install dependencies
npm install

# Build the project
npm run build

# Restart the application
nohup npm start &