# Database Migration Scripts

This directory contains SQL migration scripts for the Turso database.

## Running Migrations

### Option 1: Using Turso CLI (Recommended)

1. Install the Turso CLI if you haven't already:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```

2. Login to Turso:
   ```bash
   turso auth login
   ```

3. Find your database name:
   ```bash
   turso db list
   ```

4. Run the migration:
   ```bash
   turso db shell <your-database-name> < scripts/migrate-pool-invitations.sql
   ```

### Option 2: Using Turso Web Shell

1. Go to https://turso.tech/app
2. Select your database
3. Open the SQL shell
4. Copy and paste the contents of `migrate-pool-invitations.sql`
5. Execute the SQL

### Option 3: Local Development Only

If you're running in development mode (not production), you can use the init-db endpoint:

```bash
curl -X POST http://localhost:3000/api/admin/init-db
```

**Note:** This endpoint is disabled in production for security reasons.

## Available Migrations

- `migrate-pool-invitations.sql` - Adds the pool_invitations table for the invite & claim squares feature
- `migrate-email-consent.sql` - Adds the email_consent column to the users table for privacy policy and email opt-in tracking

## After Running Migration

After running the migration, redeploy your Vercel application or wait for the next deployment. The pool invitations feature should then work correctly.
