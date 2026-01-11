# Cron Job Setup for Auto-Lock Pools

This application includes an automatic pool locking and randomization feature that runs when the game time is reached.

## How It Works

The cron job (`/api/cron/auto-lock-pools`) runs every 5 minutes and:

1. Finds all pools with status 'open' or 'locked' where the game time has passed
2. Locks the pool (if still open)
3. Randomizes the digits automatically
4. Updates the pool status to 'numbered'

## Setup on Vercel

### 1. Set Environment Variable

Add the `CRON_SECRET` environment variable to your Vercel project:

```bash
# Generate a random secret
openssl rand -base64 32

# Or use any secure random string
```

Add this to your Vercel project:
- Go to Project Settings → Environment Variables
- Add: `CRON_SECRET` = `your-generated-secret`
- Apply to Production, Preview, and Development environments

### 2. Deploy

The cron job is configured in `vercel.json` and will automatically be set up when you deploy to Vercel.

### 3. Verify

After deployment, you can verify the cron job is working by:

1. Going to your Vercel project dashboard
2. Clicking on "Crons" in the left sidebar
3. You should see `/api/cron/auto-lock-pools` listed with a schedule of `*/5 * * * *` (every 5 minutes)

## Manual Testing

You can manually trigger the cron job for testing:

```bash
curl -X GET https://your-domain.vercel.app/api/cron/auto-lock-pools \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Notes

- The cron job runs every 5 minutes, so pools will be locked/randomized within 5 minutes of the game time
- If you want more precise timing, you can change the schedule in `vercel.json` (e.g., `* * * * *` for every minute)
- The cron job only processes pools that haven't been manually locked and randomized yet
- All auto-lock/randomize actions are logged in the event log with `auto_locked: true` and `auto_randomized: true` flags
