# Football Squares Pool MVP

A full-stack football squares pool application built for **Webflow Cloud** deployment. Create and manage squares pools for the Super Bowl, playoffs, or any football game with cryptographically secure randomization and instant winner calculations.

![Football Squares Pool](https://img.shields.io/badge/Status-MVP-green) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Edge Runtime](https://img.shields.io/badge/Runtime-Edge-orange)

## Features

- **🏈 Complete Pool Management**: Create, configure, and run football squares pools
- **🎲 Cryptographically Secure Randomization**: Fair digit assignment using Web Crypto API
- **🏆 Automatic Winner Calculation**: Instant results for Q1, Q2, Q3, Q4, and Final
- **👥 Public & Private Pools**: Share openly or use invite codes
- **📱 Mobile Responsive**: Fully functional on phones, tablets, and desktops
- **⚡ Edge-Native**: Built specifically for Webflow Cloud's edge runtime
- **🔒 Secure Authentication**: JWT-based sessions with httpOnly cookies
- **🎨 Football-Themed UI**: Stadium lights, turf gradient, scoreboard styling

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom football theme
- **Database**: SQLite (Webflow Cloud binding)
- **Authentication**: JWT + bcrypt (edge-compatible)
- **Validation**: Zod
- **Testing**: Vitest
- **Deployment**: Webflow Cloud (Cloudflare Workers edge runtime)

## Architecture

This application is designed for **Webflow Cloud**, which provides:

- **Edge Runtime**: Cloudflare Workers-based execution
- **SQLite Binding**: Co-located database with microsecond latency
- **GitHub Integration**: Automatic deployments on push
- **Environment Variables**: Managed via Webflow dashboard

### Key Constraints

1. **Edge Runtime Only**: No Node.js APIs (fs, net, child_process)
2. **Web APIs Required**: Use `fetch`, `Request`, `Response`, `crypto.subtle`
3. **SQLite Only**: Webflow provides SQLite binding (no PostgreSQL/MySQL)
4. **Path Handling**: Must respect `BASE_URL` and `ASSETS_PREFIX` env vars

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture decisions.

## Project Structure

```
football-squares-pool/
├── app/
│   ├── api/                    # API Route Handlers (edge runtime)
│   │   ├── auth/              # Authentication endpoints
│   │   ├── pools/             # Pool CRUD and actions
│   │   └── admin/             # Admin utilities
│   ├── pool/                  # Pool pages
│   ├── dashboard/             # User dashboard
│   ├── login/                 # Auth pages
│   ├── register/
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
├── components/                # React components
│   ├── SquaresBoard.tsx      # Interactive board
│   └── ...                    # See FRONTEND_REFERENCE.md
├── lib/
│   ├── auth/                  # JWT, password hashing, sessions
│   ├── db/                    # Database layer
│   │   ├── client.ts         # SQLite abstraction
│   │   ├── repositories/     # Data access layer
│   │   ├── schema.sql        # Database schema
│   │   └── types.ts          # TypeScript types
│   ├── game/                  # Business logic
│   │   ├── randomize.ts      # Digit generation
│   │   ├── winners.ts        # Winner calculation
│   │   └── __tests__/        # Unit tests
│   └── utils/                 # Utilities
├── test/                      # Test setup
├── ARCHITECTURE.md            # Architecture documentation
├── API_ROUTES_REFERENCE.md    # API implementation guide
├── FRONTEND_REFERENCE.md      # Frontend implementation guide
└── README.md                  # This file
```

## Local Development

### Prerequisites

- Node.js 18+ (for local dev)
- npm or pnpm

### Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd football-squares-pool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   ```env
   JWT_SECRET=your-secret-key-min-32-characters
   NODE_ENV=development
   ```

   Generate a secure JWT secret:
   ```bash
   openssl rand -base64 32
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Database in Local Dev

**Note**: The database layer is designed for Webflow Cloud's SQLite binding. For local development, you have two options:

#### Option 1: Mock Database (Quick Start)
- Modify `lib/db/client.ts` to use in-memory mock data
- Suitable for UI development without full backend

#### Option 2: Better-SQLite3 (Full Local Testing)
```bash
npm install better-sqlite3 @types/better-sqlite3
```

Update `lib/db/client.ts` to use better-sqlite3 when `DB` global is not available:

```typescript
import Database from 'better-sqlite3';

let localDb: any;

export function getDatabase(): Database {
  if (typeof DB !== 'undefined') {
    return DB; // Webflow Cloud binding
  }

  // Local dev fallback
  if (!localDb) {
    localDb = new Database('data/local.db');
    // Initialize schema
    const schema = fs.readFileSync('lib/db/schema.sql', 'utf-8');
    localDb.exec(schema);
  }

  return localDb;
}
```

### Running Tests

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Deployment to Webflow Cloud

### Step 1: Prepare GitHub Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Football Squares Pool MVP"
   ```

2. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/football-squares-pool.git
   git push -u origin main
   ```

   Ensure your default branch is `main` (Webflow auto-deploys from this).

### Step 2: Connect to Webflow Cloud

1. **Log in to Webflow**: Visit [webflow.com](https://webflow.com)

2. **Navigate to Sites**: Go to your dashboard → Sites

3. **Add New Site**:
   - Click "Add Site" → "Import from Git"
   - Select "GitHub" as your Git provider
   - Authorize Webflow to access your GitHub account
   - Select your `football-squares-pool` repository

4. **Configure Build Settings**:
   Webflow should auto-detect Next.js. Verify:
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
   - **Node Version**: 18 or 20

### Step 3: Set Environment Variables

In Webflow project settings → Environment Variables:

1. **Required**:
   ```
   JWT_SECRET=<your-32-char-secret>
   NODE_ENV=production
   ```

   Generate JWT_SECRET:
   ```bash
   openssl rand -base64 32
   ```

2. **Automatic** (Webflow sets these):
   - `BASE_URL`: Mount path for your app (e.g., `/app`)
   - `ASSETS_PREFIX`: CDN prefix for static assets

### Step 4: Deploy

1. **Trigger Deploy**:
   - In Webflow dashboard, click "Deploy"
   - Or push to `main` branch (triggers auto-deploy)

2. **Monitor Build**:
   - Watch build logs in real-time
   - Build typically takes 2-5 minutes

3. **Verify Deployment**:
   - Once deployed, Webflow provides a URL: `https://your-site.webflow.io`
   - Visit the URL

### Step 5: Initialize Database

**IMPORTANT**: On first deploy, you must initialize the database schema.

Visit the admin endpoint:
```
https://your-site.webflow.io/api/admin/init-db
```

You should see:
```json
{
  "success": true,
  "message": "Database schema initialized"
}
```

**Security Note**: After initialization, consider protecting this endpoint or removing it.

### Step 6: Test the Application

1. **Create an Account**:
   - Click "Sign Up"
   - Register with email/password

2. **Create a Pool**:
   - Go to Dashboard → "Create New Pool"
   - Fill in game details, teams, settings
   - Submit

3. **Claim Squares**:
   - Open the pool
   - Click squares to select
   - Click "Claim" button

4. **Lock & Randomize**:
   - As pool owner, click "Lock Board"
   - Click "Randomize Digits"
   - Observe X/Y axes populate with random digits

5. **Enter Scores**:
   - Enter scores for each quarter
   - Winners automatically calculated and highlighted

## Webflow Cloud Specifics

### BASE_URL and ASSETS_PREFIX

Webflow Cloud may mount your app at a subpath (e.g., `/app`). The app handles this via:

**next.config.js**:
```javascript
module.exports = {
  basePath: process.env.BASE_URL || '',
  assetPrefix: process.env.ASSETS_PREFIX || '',
};
```

**Usage in code**:
- Links: Use Next.js `<Link>` component (automatically prefixes)
- API calls: Use relative paths (`/api/pools`)
- Avoid hardcoding absolute URLs

### Edge Runtime Limitations

**Supported**:
- Web APIs: `fetch`, `Request`, `Response`, `crypto`, `URL`
- Pure JavaScript libraries
- Edge-compatible packages (bcryptjs, zod)

**Not Supported**:
- Node.js APIs: `fs`, `path`, `net`, `child_process`
- Node-specific database drivers (`pg`, `mysql2`, `node-sqlite3`)
- Heavy native modules

**All API routes include**:
```typescript
export const runtime = 'edge';
```

This ensures Webflow Cloud runs them in the edge environment.

### Database: SQLite Binding

Webflow Cloud provides a global `DB` object (SQLite binding):

```typescript
// In edge runtime
const db = DB; // Global provided by Webflow Cloud

// Usage
const result = db.prepare('SELECT * FROM pools WHERE id = ?').bind(poolId).get();
```

The database is:
- **Durable**: Persists across deployments
- **Fast**: Microsecond query latency (co-located with compute)
- **Scalable**: Suitable for thousands of pools

**Backup Strategy**:
- Implement periodic exports via API route
- Store exports in Cloudflare R2 or external storage
- Webflow Cloud SQLite is durable but not automatically backed up

## API Documentation

See [API_ROUTES_REFERENCE.md](./API_ROUTES_REFERENCE.md) for complete API documentation.

### Authentication

All authenticated routes require a valid JWT cookie (`auth_token`).

#### Register
```
POST /api/auth/register
Body: { email, password, name }
Response: { user: { id, email, name } }
Sets: auth_token cookie
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { user: { id, email, name } }
Sets: auth_token cookie
```

#### Logout
```
POST /api/auth/logout
Clears: auth_token cookie
```

#### Get Current User
```
GET /api/auth/me
Response: { user: { id, email, name } }
```

### Pools

#### Create Pool
```
POST /api/pools
Auth: Required
Body: { name, game_name, game_time, home_team, away_team, ... }
Response: { pool, invite_code? }
```

#### Get Pool
```
GET /api/pools/:id
Response: { pool }
```

#### Update Pool
```
PATCH /api/pools/:id
Auth: Required (owner only)
Body: { name?, game_name?, ... }
Response: { pool }
```

#### Lock Pool
```
POST /api/pools/:id/lock
Auth: Required (owner only)
Updates status: 'open' → 'locked'
```

#### Randomize Digits
```
POST /api/pools/:id/randomize
Auth: Required (owner only)
Requires: status = 'locked'
Generates X/Y axis digits
Updates status: 'locked' → 'numbered'
Response: { x_digits, y_digits }
```

### Squares

#### Claim Squares
```
POST /api/pools/:id/squares/claim
Auth: Required
Body: { squares: [{ row, col }, ...] }
Validates: unclaimed, within user limit
Response: { claimed }
```

#### Unclaim Square
```
DELETE /api/pools/:id/squares/:row/:col
Auth: Required
Response: { success }
```

### Scores & Winners

#### Update Scores
```
PUT /api/pools/:id/scores
Auth: Required (owner only)
Body: { scores: [{ bucket, home_score, away_score }, ...] }
Response: { scores }
```

#### Get Winners
```
GET /api/pools/:id/winners
Response: { winners: [{ bucket, row, col, ... }, ...] }
```

## Frontend Implementation

See [FRONTEND_REFERENCE.md](./FRONTEND_REFERENCE.md) for complete frontend documentation.

### Key Components

- **SquaresBoard**: Interactive 10x10 grid
- **PoolCard**: Pool summary card
- **StatusBadge**: Pool status indicator
- **ScoreEntryForm**: Owner score input
- **ShareLink**: Shareable pool URL with copy button

### Pages

- `/`: Landing page with hero and how-it-works
- `/login`, `/register`: Authentication
- `/dashboard`: User's pools overview
- `/pool/new`: Create pool form
- `/pool/[id]`: Pool detail with board
- `/pool/[id]/edit`: Edit pool settings

## Testing

### Unit Tests

```bash
npm test
```

Tests included:
- `lib/game/__tests__/randomize.test.ts`: Randomization uniqueness
- `lib/game/__tests__/winners.test.ts`: Winner calculation accuracy

### Integration Tests

To add integration tests for API routes:

```typescript
// Example: api/pools.test.ts
import { describe, it, expect } from 'vitest';

describe('POST /api/pools', () => {
  it('should create a pool', async () => {
    // Test implementation
  });
});
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Create public pool
- [ ] Create private pool with invite code
- [ ] Claim squares (enforce max limit)
- [ ] Prevent double-claim
- [ ] Lock board
- [ ] Randomize digits
- [ ] Enter scores
- [ ] Verify winners are calculated correctly
- [ ] Test on mobile device

## Troubleshooting

### Build Fails on Webflow Cloud

**Error**: `Module not found` or `Can't resolve`

**Solution**:
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Run `npm install` locally to verify
- Check build logs for specific missing module

### Database Not Found

**Error**: `Database not available`

**Solution**:
- Ensure you've visited `/api/admin/init-db` after first deploy
- Check Webflow Cloud provides `DB` global binding
- Verify you're using edge runtime (`export const runtime = 'edge'`)

### Authentication Not Working

**Error**: Redirects to login repeatedly

**Solution**:
- Verify `JWT_SECRET` is set in Webflow environment variables
- Check JWT_SECRET is at least 32 characters
- Clear browser cookies
- Check `secure` cookie setting matches HTTPS status

### Squares Board Not Interactive

**Solution**:
- Ensure SquaresBoard is a Client Component (`'use client'`)
- Check pool status is 'open' for claiming
- Verify user is authenticated
- Check browser console for errors

## Security Considerations

- **Password Hashing**: bcrypt with cost factor 10
- **JWT Signing**: HMAC-SHA256 with secure secret
- **Cookie Security**: httpOnly, secure (in production), sameSite=strict
- **Input Validation**: Zod schemas on all endpoints
- **SQL Injection**: Parameterized queries throughout
- **XSS Prevention**: React auto-escaping
- **CSRF**: SameSite cookie policy

## Performance

- **Edge Distribution**: Low latency worldwide
- **SQLite Co-location**: Microsecond database access
- **Server Components**: Minimal client JavaScript
- **Optimized Images**: Next.js Image component
- **Route Prefetching**: Automatic via Next.js Link

## Limitations & Future Enhancements

### Current Limitations

1. **No Real-Time Updates**: Users must refresh to see new claims
2. **Manual Score Entry**: Owner types scores
3. **Basic Auth**: Email/password only
4. **No Payments**: Entry fees are informational
5. **Single Database**: All data in one SQLite file

### Planned Enhancements

- [ ] WebSocket or SSE for real-time board updates
- [ ] OAuth (Google, Twitter)
- [ ] Sports data API integration (ESPN, The Odds API) for auto scores
- [ ] Stripe integration for paid pools
- [ ] Email notifications (SendGrid/Resend)
- [ ] Pool templates for recurring games
- [ ] Printable board PDF generation
- [ ] Admin dashboard for site-wide stats

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - See [LICENSE](./LICENSE) file for details

## Support

For issues, questions, or feedback:

1. **GitHub Issues**: [Create an issue](https://github.com/YOUR_USERNAME/football-squares-pool/issues)
2. **Documentation**: See ARCHITECTURE.md, API_ROUTES_REFERENCE.md, FRONTEND_REFERENCE.md

## Acknowledgments

- Built for **Webflow Cloud** edge runtime
- Inspired by traditional paper football squares pools
- Designed for ease of use on game day

---

**Ready for Game Day!** 🏈

Deploy this app to Webflow Cloud and never run a paper squares pool again.
