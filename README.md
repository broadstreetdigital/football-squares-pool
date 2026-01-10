# Football Squares Pool MVP

A full-stack football squares pool application built for **Vercel** deployment. Create and manage squares pools for the Super Bowl, playoffs, or any football game with cryptographically secure randomization and instant winner calculations.

![Football Squares Pool](https://img.shields.io/badge/Status-MVP-green) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## Features

- **🏈 Complete Pool Management**: Create, configure, and run football squares pools
- **🎲 Cryptographically Secure Randomization**: Fair digit assignment using Web Crypto API
- **🏆 Automatic Winner Calculation**: Instant results for Q1, Q2, Q3, Q4, and Final
- **👥 Public & Private Pools**: Share openly or use invite codes
- **📱 Mobile Responsive**: Fully functional on phones, tablets, and desktops
- **⚡ Serverless**: Optimized for Vercel's serverless functions
- **🔒 Secure Authentication**: JWT-based sessions with httpOnly cookies
- **🎨 Football-Themed UI**: Stadium lights, turf gradient, scoreboard styling

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom football theme
- **Database**: Turso (libSQL) - Edge-compatible SQLite
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Testing**: Vitest
- **Deployment**: Vercel

## Architecture

This application is designed for **Vercel**, which provides:

- **Serverless Functions**: Automatic scaling with zero configuration
- **Edge Network**: Global CDN for fast content delivery
- **GitHub Integration**: Automatic deployments on push
- **Environment Variables**: Managed via Vercel dashboard
- **Turso Database**: Edge-compatible SQLite database with global replication

### Key Features

1. **Modern Next.js**: Uses App Router with Server Components
2. **Turso Database**: libSQL (SQLite) with edge compatibility
3. **Optimized Performance**: Image optimization, compression, and caching
4. **Security**: Enhanced security headers and best practices

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

### Database Setup with Turso

This application uses **Turso** (libSQL) for the database, which works perfectly with Vercel:

1. **Create a Turso account**: Visit [turso.tech](https://turso.tech) and sign up
2. **Create a database**:
   ```bash
   turso db create football-squares
   ```
3. **Get your database URL and auth token**:
   ```bash
   turso db show football-squares --url
   turso db tokens create football-squares
   ```
4. **Add to your `.env.local`**:
   ```env
   TURSO_DATABASE_URL=libsql://your-database.turso.io
   TURSO_AUTH_TOKEN=your-auth-token
   ```
5. **Initialize the schema**:
   - Run your dev server: `npm run dev`
   - Visit: `http://localhost:3000/api/admin/init-db`

### Running Tests

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Deployment to Vercel

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

   Ensure your default branch is `main` (Vercel auto-deploys from this).

### Step 2: Create Turso Database

1. **Install Turso CLI**:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```

2. **Create database**:
   ```bash
   turso db create football-squares
   ```

3. **Get credentials**:
   ```bash
   turso db show football-squares --url
   turso db tokens create football-squares
   ```

   Save these for the next step!

### Step 3: Deploy to Vercel

1. **Visit Vercel**: Go to [vercel.com](https://vercel.com) and sign in with GitHub

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Select your `football-squares-pool` repository
   - Click "Import"

3. **Configure Project**:
   Vercel should auto-detect Next.js. Defaults are correct:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
   - **Node Version**: 18.x or 20.x

4. **Set Environment Variables**:
   Click "Environment Variables" and add:
   ```
   JWT_SECRET=<your-32-char-secret>
   TURSO_DATABASE_URL=<from step 2>
   TURSO_AUTH_TOKEN=<from step 2>
   NODE_ENV=production
   ```

   Generate JWT_SECRET:
   ```bash
   openssl rand -base64 32
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Vercel will provide a URL: `https://your-project.vercel.app`

### Step 4: Initialize Database

**IMPORTANT**: On first deploy, initialize the database schema.

Visit the admin endpoint:
```
https://your-project.vercel.app/api/admin/init-db
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

## Vercel Optimizations

### Performance Features

This application is optimized for Vercel with:

- **Automatic Code Splitting**: Next.js optimizes bundle sizes
- **Image Optimization**: Built-in image optimization with AVIF/WebP support
- **Edge Caching**: Static assets cached globally via CDN
- **Serverless Functions**: API routes auto-scale based on demand
- **Compression**: Gzip/Brotli compression enabled

### Database: Turso (libSQL)

This app uses **Turso** for the database, which offers:

```typescript
// Database client usage
import { query, execute } from '@/lib/db/client';

// Query data
const pools = await query('SELECT * FROM pools WHERE owner_id = ?', [userId]);

// Execute mutations
await execute('INSERT INTO pools (id, name, owner_id) VALUES (?, ?, ?)',
  [id, name, ownerId]);
```

**Benefits**:
- **Edge-Compatible**: Works with Vercel's serverless functions
- **Global Distribution**: Replicate data to multiple regions
- **Low Latency**: Fast queries from anywhere in the world
- **Generous Free Tier**: Perfect for MVP and production
- **SQLite Compatibility**: Standard SQLite syntax

**Backup & Monitoring**:
- Turso provides automatic backups
- View analytics in Turso dashboard
- Monitor query performance and database size

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

### Build Fails on Vercel

**Error**: `Module not found` or `Can't resolve`

**Solution**:
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Run `npm install` locally to verify
- Check build logs for specific missing module

### Database Not Found

**Error**: `Database not available` or `TURSO_DATABASE_URL is required`

**Solution**:
- Ensure you've visited `/api/admin/init-db` after first deploy
- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set in Vercel environment variables
- Check Turso database is created and accessible
- Redeploy after adding environment variables

### Authentication Not Working

**Error**: Redirects to login repeatedly

**Solution**:
- Verify `JWT_SECRET` is set in Vercel environment variables
- Check JWT_SECRET is at least 32 characters
- Clear browser cookies
- Redeploy after adding environment variables

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

- **Global CDN**: Vercel's edge network for fast content delivery
- **Turso Edge Database**: Low latency database queries worldwide
- **Server Components**: Minimal client JavaScript
- **Optimized Images**: Next.js Image component with AVIF/WebP
- **Route Prefetching**: Automatic via Next.js Link
- **Automatic Caching**: Smart caching for optimal performance

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

- Built for **Vercel** serverless platform
- Database powered by **Turso** (libSQL)
- Inspired by traditional paper football squares pools
- Designed for ease of use on game day

---

**Ready for Game Day!** 🏈

Deploy this app to Vercel and never run a paper squares pool again.
