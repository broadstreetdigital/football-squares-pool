# Deployment Checklist - Football Squares Pool

Use this checklist to ensure successful deployment to Webflow Cloud.

## Pre-Deployment

### 1. Code Quality
- [ ] All TypeScript files compile without errors (`npm run type-check`)
- [ ] All tests pass (`npm test`)
- [ ] No console errors in local development
- [ ] All forms validate input correctly
- [ ] Edge runtime compatibility verified (no Node.js APIs used)

### 2. Environment Variables Prepared
- [ ] JWT_SECRET generated (32+ characters)
  ```bash
  openssl rand -base64 32
  ```
- [ ] `.env.example` is up to date
- [ ] `.env` is in `.gitignore` (never commit secrets!)

### 3. Git Repository
- [ ] All changes committed
- [ ] Pushed to GitHub
- [ ] Default branch is `main`
- [ ] Repository is accessible

## Webflow Cloud Setup

### 4. Connect Repository
- [ ] Logged into Webflow
- [ ] Navigated to Sites → Add Site → Import from Git
- [ ] GitHub account connected
- [ ] Repository selected
- [ ] Framework auto-detected as Next.js

### 5. Build Configuration
Verify in Webflow build settings:
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`
- [ ] Node Version: 18 or 20

### 6. Environment Variables Set
In Webflow project settings → Environment Variables:
- [ ] `JWT_SECRET` = `<your-generated-secret>`
- [ ] `NODE_ENV` = `production`

## Deployment

### 7. Initial Deploy
- [ ] Triggered deploy in Webflow dashboard
- [ ] Build logs monitored (no errors)
- [ ] Build completed successfully
- [ ] Deployment URL received

### 8. Database Initialization
**CRITICAL STEP**:
- [ ] Visited `https://your-site.webflow.io/api/admin/init-db`
- [ ] Received success response:
  ```json
  {
    "success": true,
    "message": "Database schema initialized successfully"
  }
  ```

## Post-Deployment Verification

### 9. Smoke Tests
- [ ] Landing page loads
- [ ] Can register new account
- [ ] Can login with created account
- [ ] Can create a pool
- [ ] Can view pool detail page
- [ ] Can claim squares (if pool is open)
- [ ] Owner can lock board
- [ ] Owner can randomize digits
- [ ] Digits display on board axes
- [ ] Owner can enter scores
- [ ] Winners calculated correctly
- [ ] Mobile responsiveness verified

### 10. Security Checks
- [ ] HTTPS enabled (Webflow provides this automatically)
- [ ] Auth cookies are httpOnly
- [ ] JWT expiry is enforced (24 hours)
- [ ] Password requirements enforced (8+ chars)
- [ ] SQL injection protected (parameterized queries)
- [ ] XSS protected (React auto-escaping)

### 11. Performance Checks
- [ ] Page load time < 2 seconds
- [ ] Board renders smoothly
- [ ] API responses < 500ms
- [ ] Images optimized
- [ ] No unnecessary client JavaScript

## Troubleshooting

### Build Fails
If build fails:
1. Check build logs in Webflow dashboard
2. Verify all dependencies in `package.json`
3. Run `npm run build` locally to reproduce
4. Check for Node.js-only dependencies (not edge-compatible)

### Database Errors
If database errors occur:
1. Verify `/api/admin/init-db` was called
2. Check Webflow provides `DB` global binding
3. Verify edge runtime is used (`export const runtime = 'edge'`)

### Authentication Issues
If auth not working:
1. Verify `JWT_SECRET` is set in environment variables
2. Check JWT_SECRET is at least 32 characters
3. Clear browser cookies and try again
4. Check cookie security settings (httpOnly, secure)

### Environment Variables Not Available
If env vars not working:
1. Verify they're set in Webflow dashboard (not just `.env` file)
2. Redeploy after adding env vars
3. Check spelling exactly matches code

## Monitoring

### 12. Post-Launch Monitoring
- [ ] Set up error tracking (optional: Sentry)
- [ ] Monitor Webflow Cloud logs
- [ ] Track user registrations
- [ ] Monitor pool creation rate
- [ ] Check for failed API requests

## Rollback Plan

If critical issues occur:

1. **Immediate Rollback**:
   ```bash
   git revert HEAD
   git push origin main
   ```
   Webflow will auto-deploy previous version

2. **Database Rollback**:
   - No automatic rollback for database
   - Implement export/backup strategy before schema changes

## Optional Enhancements

### 13. Custom Domain (Optional)
- [ ] Domain purchased
- [ ] DNS configured in Webflow
- [ ] SSL certificate issued
- [ ] Domain verified

### 14. Analytics (Optional)
- [ ] Google Analytics added
- [ ] Plausible or similar privacy-friendly analytics
- [ ] Conversion tracking set up

### 15. Backup Strategy
- [ ] Implement database export API
- [ ] Schedule periodic backups
- [ ] Test restore process

## Success Criteria

Deployment is successful when:

✅ All users can:
- Register and login
- Create public/private pools
- Claim squares
- View board updates

✅ Pool owners can:
- Edit pool settings (when open)
- Lock board
- Randomize digits
- Enter scores

✅ System:
- Calculates winners correctly
- Enforces square limits
- Prevents double-claims
- Works on mobile devices

## Next Steps

After successful deployment:

1. **Share with Users**: Send pool URL to participants
2. **Monitor**: Watch for errors in first 24 hours
3. **Iterate**: Gather feedback and plan improvements
4. **Scale**: Monitor performance as usage grows

---

**Deployment Complete!** 🎉

Your Football Squares Pool is live on Webflow Cloud and ready for game day.
