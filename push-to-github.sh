#!/bin/bash

echo "🚀 Pushing AI clause updates to GitHub for Railway deployment"
echo ""
echo "This script will push your changes to GitHub so Railway can deploy them."
echo ""
echo "When prompted:"
echo "1. Enter your GitHub username: msimka"
echo "2. Enter your GitHub Personal Access Token (NOT your password)"
echo "   - To create a token: GitHub Settings > Developer settings > Personal access tokens"
echo "   - Token needs 'repo' permissions"
echo ""
echo "Press Enter to continue..."
read

# Push to GitHub
git push https://github.com/msimka/electronic-signature-app.git main

echo ""
echo "✅ If successful, Railway will automatically deploy the changes!"
echo "Check your Railway dashboard in a minute to see the deployment status."