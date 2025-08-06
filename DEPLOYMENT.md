# Deployment Guide for Sandwich Project Platform

## Architecture Overview

This application consists of:
- **Frontend**: React + Vite (can be deployed to GitHub Pages)
- **Backend**: Express.js API server (needs a server platform)
- **Database**: PostgreSQL (using Supabase)
- **Auth**: Supabase Authentication

## Deployment Options

### Option 1: GitHub Pages (Frontend) + Render (Backend) - FREE

#### Step 1: Deploy Backend to Render.com

1. Create account at [render.com](https://render.com)

2. Connect your GitHub repository

3. Create a new Web Service:
   - **Name**: sandwich-project-api
   - **Branch**: main
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `npm run start:server`

4. Add environment variables in Render dashboard:
   ```
   NODE_ENV=production
   PORT=5001
   DATABASE_URL=(your PostgreSQL connection string)
   SUPABASE_SERVICE_ROLE_KEY=(from Supabase dashboard)
   VITE_SUPABASE_URL=(from Supabase dashboard)
   SENDGRID_API_KEY=(if using email)
   SESSION_SECRET=(generate random string)
   JWT_SECRET=(generate random string)
   CORS_ORIGIN=https://[your-github-username].github.io
   ```

5. Copy your Render URL (e.g., `https://sandwich-project-api.onrender.com`)

#### Step 2: Deploy Frontend to GitHub Pages

1. Update `vite.config.production.ts`:
   ```typescript
   base: '/Sandwich-Project-Platform/', // Your repo name
   ```

2. Go to GitHub repository → Settings → Secrets → Actions

3. Add these secrets:
   ```
   VITE_SUPABASE_URL=(from Supabase)
   VITE_SUPABASE_ANON_KEY=(from Supabase)
   VITE_API_URL=(your Render backend URL)
   ```

4. Enable GitHub Pages:
   - Go to Settings → Pages
   - Source: GitHub Actions

5. Push to main branch or run workflow manually:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

### Option 2: Vercel (Full Stack) - FREE with limits

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Create `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/$1" }
     ]
   }
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variables in Vercel dashboard

### Option 3: Railway (Full Stack) - $5/month

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Deploy:
   ```bash
   railway login
   railway init
   railway up
   ```

3. Add environment variables in Railway dashboard

## Post-Deployment Steps

### 1. Update Supabase URLs

In Supabase dashboard → Authentication → URL Configuration:
- Site URL: `https://[your-username].github.io/Sandwich-Project-Platform`
- Redirect URLs: Add your production URL

### 2. Update CORS Origins

Make sure your backend allows requests from your frontend domain.

### 3. Test Authentication

1. Try logging in with your admin account
2. Check if API calls work
3. Verify WebSocket connections (if using chat)

### 4. Monitor & Debug

- Render: Check logs at dashboard.render.com
- GitHub Pages: Check Actions tab for build logs
- Supabase: Monitor at app.supabase.com

## Local Testing of Production Build

```bash
# Build frontend
npm run build:client

# Build backend
npm run build:server

# Start production server
NODE_ENV=production npm start

# Preview at http://localhost:5001
```

## Troubleshooting

### CORS Issues
- Check `CORS_ORIGIN` environment variable matches your frontend URL
- Ensure credentials are included in fetch requests

### Database Connection
- Verify `DATABASE_URL` is correct
- Check if Supabase allows connections from your backend IP

### Authentication Failures
- Verify Supabase keys are correct
- Check if JWT tokens are being sent in headers
- Ensure backend can verify Supabase tokens

### Build Failures
- Check Node version (should be 18+)
- Verify all dependencies are in package.json
- Check TypeScript errors with `npm run check`

## Continuous Deployment

The GitHub Actions workflow will automatically deploy when you push to main branch.

To deploy manually:
```bash
# Frontend only
npm run deploy:gh-pages

# Or trigger GitHub Action
gh workflow run deploy.yml
```

## Cost Summary

- **GitHub Pages**: FREE
- **Render.com**: FREE (with cold starts)
- **Supabase**: FREE (up to 500MB database)
- **Total**: $0/month for basic deployment

## Security Checklist

- [ ] Environment variables are set in production
- [ ] CORS is configured correctly
- [ ] Database connections use SSL
- [ ] Sensitive keys are not in code
- [ ] HTTPS is enabled on all services
- [ ] Rate limiting is configured
- [ ] Error messages don't leak sensitive info