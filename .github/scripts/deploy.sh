#!/bin/bash

mkdir -p ~/roomey-api

# Navigate to the project directory
cd ~/roomey-api

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "npm could not be found, installing nvm, Node.js, and npm"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
    nvm install 20
    nvm use 20
else
    # Ensure nvm is loaded
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
fi

pwd

if [ ! -d ".git" ]; then
  echo "Initializing a new git repository..."
  git init
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