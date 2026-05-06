# GitHub & Vercel Deployment Guide

## Step 1: Create a GitHub Repository

1. **Go to GitHub**:
   - Visit [https://github.com/new](https://github.com/new)
   - Sign in to your GitHub account (create one if you don't have it)

2. **Create a new repository**:
   - Repository name: `course-roadmap` (or your preferred name)
   - Description: "AI-powered course syllabus to learning roadmap generator"
   - Choose: **Public** (to deploy on Vercel)
   - Do NOT initialize with README, .gitignore, or license (we already have these)
   - Click **Create repository**

3. **Get your repository URL**:
   - After creation, you'll see the repository URL like: `https://github.com/your-username/course-roadmap.git`
   - Copy this URL

## Step 2: Push Code to GitHub

Run these commands in your terminal from the `course-roadmap` directory:

```bash
# Add the remote repository
git remote add origin https://github.com/your-username/course-roadmap.git

# Rename branch to main (if needed)
git branch -M main

# Push your code
git push -u origin main
```

Replace `your-username` with your actual GitHub username.

## Step 3: Add Your Groq API Key

1. **Get a Groq API Key**:
   - Go to [https://console.groq.com/keys](https://console.groq.com/keys)
   - Sign up or log in with your account
   - Create a new API key
   - Copy the key (you won't see it again)

2. **Update .env.local locally** (for testing):
   ```
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```

3. **Test the app locally**:
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000
   - Try uploading a sample syllabus to verify everything works

## Step 4: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel**:
   - Visit [https://vercel.com](https://vercel.com)
   - Click "Sign up" or "Sign in"
   - You can sign up with your GitHub account for easier integration

2. **Create a new project**:
   - Click "New Project"
   - Click "Import Git Repository"
   - Select "GitHub" and authorize if prompted
   - Find and select your `course-roadmap` repository
   - Click "Import"

3. **Configure environment variables**:
   - You'll see a "Configure Project" screen
   - Look for "Environment Variables" section
   - Add a new variable:
     - Name: `GROQ_API_KEY`
     - Value: Paste your Groq API key from Step 3
   - Click "Add"

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (usually 1-2 minutes)
   - You'll get a deployment URL like: `https://course-roadmap-xxxx.vercel.app`

### Option B: Using Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd c:\Users\raisi\Documents\Coding\ Projects\acm_devweek\test\course-roadmap
   vercel
   ```

3. **Follow the prompts**:
   - Link to your Vercel account
   - Link to an existing project or create new
   - When asked about environment variables, add `GROQ_API_KEY`
   - Confirm deployment

## Step 5: Verify Your Deployment

1. **Visit your Vercel deployment URL**
2. **Test the application**:
   - Upload/paste a sample syllabus
   - Select a skill level
   - Click "Generate Roadmap"
   - Verify the results display correctly

## Sample Syllabus for Testing

If you need a syllabus to test with, here's an example:

```
Introduction to Web Development Course

Week 1: HTML Basics
- Learn HTML5 structure and semantic elements
- Create your first web page
- Understand forms and inputs

Week 2: CSS Fundamentals
- CSS selectors, properties, and values
- Box model and layouts
- Flexbox basics

Week 3: JavaScript Basics
- Variables, data types, and operators
- Functions and scope
- DOM manipulation

Week 4: Intermediate JavaScript
- Arrays and objects
- Callbacks and array methods
- Async/await introduction

Week 5: React Fundamentals
- Components and JSX
- Props and state
- Hooks (useState, useEffect)

Week 6: Building Web Applications
- API integration
- State management
- Responsive design

Week 7: Advanced Topics
- Performance optimization
- Testing
- Deployment

Week 8: Final Project
- Build a complete application
- Deploy to production
- Code review and feedback
```

## Troubleshooting

### Deployment fails with "API key not found"
- Make sure you added the `GROQ_API_KEY` environment variable to Vercel
- Go to Vercel Project Settings → Environment Variables
- Verify the key is correct

### "Failed to process syllabus" error
- Check that your Groq API key is valid
- Verify the Groq API key has sufficient credits
- Check browser console for more details

### Changes not reflecting after pushing to GitHub
- Vercel automatically deploys on every push to main
- If it doesn't, manually trigger a rebuild in Vercel dashboard
- Go to "Deployments" and click "Redeploy"

### Port 3000 already in use locally
```bash
# Kill the process on port 3000 (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Or use a different port
npm run dev -- -p 3001
```

## After Deployment

### Share your app
- Your live URL: `https://your-project-name.vercel.app`
- Share this link with anyone to let them use the app

### Make updates
- Edit code locally
- Commit and push to GitHub
- Vercel automatically redeploys

```bash
git add .
git commit -m "Update description or feature"
git push origin main
```

### Monitor deployments
- Go to your Vercel project dashboard
- View all deployments and their logs
- Rollback to previous versions if needed

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Your Groq API authentication key | Yes |

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Groq API Docs**: https://console.groq.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Done!** Your Course Roadmap Generator should now be live on Vercel. 🚀
