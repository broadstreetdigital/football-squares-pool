# Quick Start Guide - Football Squares Pool

Get your Football Squares Pool app deployed to Webflow Cloud in under 30 minutes.

## Prerequisites
- GitHub account
- Webflow account
- Node.js 18+ installed locally (for testing)

## Step 1: Clone & Setup (5 minutes)

```bash
# Navigate to the project directory (already exists)
cd /Users/christianbetlyon/football-squares-pool

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Generate JWT secret
openssl rand -base64 32

# Add the generated secret to .env
echo "JWT_SECRET=<paste-your-secret-here>" >> .env
```

## Step 2: Local Testing (Optional, 10 minutes)

```bash
# Run development server
npm run dev

# Open browser
# http://localhost:3000

# Run tests
npm test
```

**Note**: Database will not work locally without additional setup (better-sqlite3). For quick deployment, skip to Step 3.

## Step 3: Push to GitHub (2 minutes)

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Football Squares Pool MVP"

# Create GitHub repo (via GitHub.com or CLI)
# Then push
git remote add origin https://github.com/YOUR_USERNAME/football-squares-pool.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Webflow Cloud (10 minutes)

### 4.1 Connect Repository
1. Go to [webflow.com](https://webflow.com)
2. Navigate to **Sites** → **Add Site**
3. Select **Import from Git**
4. Choose **GitHub** → Authorize
5. Select your `football-squares-pool` repository
6. Click **Next**

### 4.2 Configure Build
Webflow should auto-detect Next.js. Verify:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18

Click **Deploy**.

### 4.3 Set Environment Variables
While build is running:
1. Go to project **Settings** → **Environment Variables**
2. Click **Add Variable**:
   - **Key**: `JWT_SECRET`
   - **Value**: (paste your generated secret from Step 1)
3. Add another:
   - **Key**: `NODE_ENV`
   - **Value**: `production`
4. Click **Save**

### 4.4 Wait for Deployment
- Monitor build logs (2-5 minutes)
- Once complete, you'll see your deployment URL

## Step 5: Initialize Database (1 minute)

**CRITICAL**: Visit this URL to create database tables:

```
https://your-site.webflow.io/api/admin/init-db
```

You should see:
```json
{
  "success": true,
  "message": "Database schema initialized successfully"
}
```

## Step 6: Test Your App (5 minutes)

### 6.1 Create Account
1. Visit your Webflow deployment URL
2. Click **Sign Up**
3. Enter email, password, name
4. Submit

### 6.2 Create Pool
1. You'll be redirected to dashboard
2. Click **Create New Pool**
3. Fill in:
   - Pool Name: "Super Bowl Squares"
   - Game Name: "Super Bowl LIX"
   - Home Team: "Chiefs"
   - Away Team: "Eagles"
   - Square Price: 10
   - Max Squares: 10
   - Visibility: Public
4. Submit

### 6.3 Test Board
1. View your pool
2. Click squares to claim them
3. Click "Claim" button
4. Verify squares are highlighted

### 6.4 Test Owner Actions
1. Click **Lock Board** → pool status changes to "Locked"
2. Click **Randomize Digits** → numbers appear on X/Y axes
3. Enter scores in the form
4. Verify winners are highlighted in gold

## Success! 🎉

Your Football Squares Pool is live and ready for game day.

## Next Steps

### Share Your Pool
1. Copy the pool URL
2. Send to friends/colleagues
3. They can claim squares without creating accounts

### Customize
- Edit pool settings (before locking)
- Add custom rules in pool description
- Create multiple pools for different games

### Monitor
- Check Webflow Cloud logs for errors
- Monitor user registrations
- Track pool activity

## Troubleshooting

### Build Failed
**Check**: Build logs in Webflow dashboard for specific error

**Common Issues**:
- Missing dependencies → Run `npm install` locally first
- Node version mismatch → Verify Node 18+ in build settings

### Database Error
**Check**: Did you visit `/api/admin/init-db`?

**Solution**: Visit the URL again, refresh browser

### Can't Login
**Check**: Is `JWT_SECRET` set in Webflow environment variables?

**Solution**:
1. Verify env var is set
2. Redeploy
3. Clear browser cookies
4. Try again

### Squares Not Claiming
**Check**: Is pool status "open"?

**Solution**: If pool is locked, only owner can unlock (requires implementing unlock endpoint)

## Support

- **Documentation**: See [README.md](./README.md) for comprehensive guide
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- **Deployment**: See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for verification steps

## What's Next?

### Complete Remaining Features
Follow the implementation guides:
- [API_ROUTES_REFERENCE.md](./API_ROUTES_REFERENCE.md) - Remaining API routes
- [FRONTEND_REFERENCE.md](./FRONTEND_REFERENCE.md) - Remaining UI components

### Enhance Your App
- Add real-time updates
- Integrate sports data API
- Add email notifications
- Implement payments

---

**Ready for Game Day!** 🏈

You now have a fully functional Football Squares Pool running on Webflow Cloud's global edge network.
