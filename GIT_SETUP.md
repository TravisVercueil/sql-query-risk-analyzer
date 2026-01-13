# Git Repository Setup Instructions

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Repository name: `sql-query-risk-analyzer` (or your preferred name)
4. Description: "AI-powered SQL query performance analyzer with React, TypeScript, and OpenAI API"
5. Set to **Public**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 2: Link Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
cd "e:\2026 Projects Coding\project"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SQL Query Risk Analyzer"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/sql-query-risk-analyzer.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify

1. Go to your GitHub repository page
2. You should see all your files
3. The README.md should be visible on the repository homepage

## Optional: Add GitHub Actions or Other CI/CD

You can add workflows later for:
- Automated testing
- Build verification
- Deployment

## Notes

- Make sure `.env` files are in `.gitignore` (they already are)
- Never commit API keys or sensitive data
- The repository is set to public, so anyone can see the code
