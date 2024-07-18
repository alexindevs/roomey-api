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

ls -al

REPO_URL="https://github.com/alexindevs/roomey-api.git"

# Check if remote origin exists
if ! git ls-remote --exit-code origin &> /dev/null; then
    echo "Remote 'origin' does not exist. Adding it now..."
    git remote add origin "$REPO_URL"
else
    echo "Remote 'origin' already exists."
    # Verify if the URL matches
    CURRENT_URL=$(git config --get remote.origin.url)
    if [ "$CURRENT_URL" != "$REPO_URL" ]; then
        echo "Updating remote 'origin' URL to $REPO_URL"
        git remote set-url origin "$REPO_URL"
    else
        echo "Remote 'origin' URL is already set correctly."
    fi
fi

# Pull the latest changes from the main branch
git pull origin main

# Install dependencies
npm install

# Build the project
npm run build

# Start the application in the background and disown the process
nohup npm start > /dev/null 2>&1 &

# Optionally, you can wait for a few seconds before exiting to ensure the application has started
sleep 15

# Print a message indicating the application has started
echo "Application started successfully."

# Exit the script with success status
exit 0