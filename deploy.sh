#!/bin/bash

mkdir -p ~/roomey-api

# Navigate to the project directory
cd ~/roomey-api

# Pull the latest changes from the main branch
git pull origin main

# Install dependencies
npm install

# Build the project
npm run build

# Restart the application
nohup npm start &