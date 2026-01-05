# Football Squares Pool - Architecture Overview

## Platform: Webflow Cloud Deployment

### Deployment Model
This application is built specifically for **Webflow Cloud**, which provides:
- **Automated GitHub deployments**: Push to main → automatic build & deploy
- **Edge runtime environment**: Cloudflare Workers-based, similar to Vercel Edge
- **Framework support**: Next.js (App Router) and Astro
- **Built-in SQLite binding**: Edge-native persistence without external database

### Architecture Decisions

#### 1. Framework: Next.js 14+ (App Router)
**Why**:
- Officially supported by Webflow Cloud
- App Router provides clean separation of server/client components
- Route Handlers work seamlessly in edge runtime
- Excellent TypeScript support

**Edge Runtime Constraints**:
- No Node.js-only APIs (fs, net, child_process)
- Use Web APIs: `fetch`, `Request`, `Response`, `crypto`
- SQLite access via Webflow Cloud binding (not node-sqlite3)
- Keep dependencies minimal and edge-compatible

#### 2. Database: Webflow Cloud SQLite Binding
**Why**:
- Native to Webflow Cloud edge environment
- Zero-latency (co-located with compute)
- No external database to manage
- Perfect for MVP scale (thousands of pools)

**Schema Strategy**:
```
users → auth & identity
pools → game configuration
squares → board claims (100 per pool)
axis_assignments → randomized digits
scores → quarter/final scores
event_log → audit trail
```

**Migration Approach**:
- Schema initialization via API route `/api/admin/init-db`
- Idempotent CREATE TABLE IF NOT EXISTS
- Safe for repeated deploys
- Owner manually triggers on first deploy

#### 3. Authentication: JWT + HTTP-Only Cookies
**Why**:
- Edge-compatible (Web Crypto API for signing)
- Stateless sessions (no server-side session store needed)
- Secure: httpOnly cookies prevent XSS

**Implementation**:
- bcrypt for password hashing (edge-compatible version)
- Web Crypto API for JWT signing (HMAC-SHA256)
- Cookie: `auth_token`, httpOnly, secure, sameSite=strict

#### 4. State Management: Server-First
**Why**:
- Minimize client bundle
- Leverage Next.js Server Components
- Only hydrate interactive components (board claiming)

**Pattern**:
- Server Components fetch data directly from SQLite
- Client Components for interactive board, claim buttons
- React Server Actions for mutations (optional enhancement)

#### 5. Styling: TailwindCSS + Custom Football Theme
**Why**:
- Zero runtime JS cost
- Excellent DX with Next.js
- Easy theming with CSS variables

**Theme**:
- Turf green gradients: `#1a4d2e` → `#0f3820`
- Stadium gold accents: `#fbbf24`
- Bold sports font: "Teko" from Google Fonts
- Scoreboard-style cards with LED-like text

---

## System Architecture

### Request Flow
```
User Browser
    ↓
Webflow Cloud Edge (Cloudflare Workers)
    ↓
Next.js App Router
    ↓ (Server Components)
    ├─→ /app/page.tsx → Landing
    ├─→ /app/dashboard → User pools
    ├─→ /app/pool/[id] → Board view
    ↓ (Route Handlers)
    ├─→ /api/auth/* → Login/Register
    ├─→ /api/pools/* → CRUD operations
    ↓
SQLite (via Webflow binding)
```

### Webflow Cloud Environment Variables
**Required**:
- `JWT_SECRET`: 32+ char secret for signing tokens
- `DATABASE_PATH` (optional): Webflow provides default SQLite binding

**Automatic** (set by Webflow):
- `BASE_URL`: Mount path for the app (e.g., `/app`)
- `ASSETS_PREFIX`: CDN path for static assets

**Handling BASE_URL**:
```typescript
// next.config.js
const basePath = process.env.BASE_URL || '';
module.exports = { basePath };
```

**Handling ASSETS_PREFIX**:
```typescript
// next.config.js
const assetPrefix = process.env.ASSETS_PREFIX || '';
module.exports = { assetPrefix };
```

---

## Data Model

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

### Pools Table
```sql
CREATE TABLE pools (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  game_name TEXT NOT NULL,
  game_time INTEGER NOT NULL,
  entry_fee_info TEXT,
  square_price REAL NOT NULL,
  max_squares_per_user INTEGER NOT NULL,
  visibility TEXT NOT NULL CHECK(visibility IN ('public', 'private')),
  invite_code_hash TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'locked', 'numbered', 'completed')),
  rules TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### Squares Table
```sql
CREATE TABLE squares (
  pool_id TEXT NOT NULL,
  row INTEGER NOT NULL CHECK(row >= 0 AND row <= 9),
  col INTEGER NOT NULL CHECK(col >= 0 AND col <= 9),
  claimed_by_user_id TEXT,
  claimed_display_name TEXT,
  claimed_email TEXT,
  claimed_at INTEGER,
  PRIMARY KEY (pool_id, row, col),
  FOREIGN KEY (pool_id) REFERENCES pools(id),
  FOREIGN KEY (claimed_by_user_id) REFERENCES users(id)
);
```

### Axis Assignments Table
```sql
CREATE TABLE axis_assignments (
  pool_id TEXT PRIMARY KEY,
  x_digits_json TEXT NOT NULL,
  y_digits_json TEXT NOT NULL,
  randomized_at INTEGER NOT NULL,
  FOREIGN KEY (pool_id) REFERENCES pools(id)
);
```

### Scores Table
```sql
CREATE TABLE scores (
  pool_id TEXT NOT NULL,
  bucket TEXT NOT NULL CHECK(bucket IN ('Q1', 'Q2', 'Q3', 'Q4', 'FINAL')),
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (pool_id, bucket),
  FOREIGN KEY (pool_id) REFERENCES pools(id)
);
```

### Event Log Table
```sql
CREATE TABLE event_log (
  id TEXT PRIMARY KEY,
  pool_id TEXT NOT NULL,
  actor_user_id TEXT,
  type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (pool_id) REFERENCES pools(id),
  FOREIGN KEY (actor_user_id) REFERENCES users(id)
);
```

---

## API Design

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT cookie
- `POST /api/auth/logout` - Clear cookie
- `GET /api/auth/me` - Get current user

### Pools
- `POST /api/pools` - Create pool (auth required)
- `GET /api/pools/:id` - Get pool details
- `PATCH /api/pools/:id` - Update pool (owner only)
- `POST /api/pools/:id/join` - Join with invite code
- `POST /api/pools/:id/lock` - Lock board (owner only)
- `POST /api/pools/:id/randomize` - Assign digits (owner only, after lock)
- `GET /api/pools/:id/board` - Get board state
- `POST /api/pools/:id/squares/claim` - Claim squares
- `DELETE /api/pools/:id/squares/:row/:col` - Unclaim square

### Scores & Winners
- `PUT /api/pools/:id/scores` - Update scores (owner only)
- `GET /api/pools/:id/winners` - Calculate winners

### Admin
- `POST /api/admin/init-db` - Initialize schema (one-time)

---

## Core Business Logic

### Randomization Algorithm
```typescript
function generateRandomDigits(): number[] {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Fisher-Yates shuffle using Web Crypto for randomness
  for (let i = digits.length - 1; i > 0; i--) {
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    const j = randomBytes[0] % (i + 1);
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
}
```

### Winner Calculation
```typescript
function calculateWinner(
  homeScore: number,
  awayScore: number,
  xDigits: number[],
  yDigits: number[]
): { row: number; col: number } {
  const homeLastDigit = homeScore % 10;
  const awayLastDigit = awayScore % 10;

  // X axis = Away team, Y axis = Home team
  const col = xDigits.indexOf(awayLastDigit);
  const row = yDigits.indexOf(homeLastDigit);

  return { row, col };
}
```

### Claim Validation
```typescript
async function validateClaim(
  poolId: string,
  userId: string,
  squares: { row: number; col: number }[]
): Promise<void> {
  // 1. Check pool is open
  const pool = await getPool(poolId);
  if (pool.status !== 'open') throw new Error('Pool is locked');

  // 2. Check squares are unclaimed
  const existing = await getSquares(poolId, squares);
  if (existing.some(s => s.claimed_by_user_id)) {
    throw new Error('Square already claimed');
  }

  // 3. Check user limit
  const userSquares = await getUserSquareCount(poolId, userId);
  if (userSquares + squares.length > pool.max_squares_per_user) {
    throw new Error('Exceeds max squares per user');
  }
}
```

---

## Front-End Pages

### 1. Landing Page (`/`)
- Hero with stadium background
- CTA buttons: "Create Pool" / "Join Pool"
- How it works: 4-step process
- Footer with links

### 2. Auth Pages
- `/login` - Email/password form
- `/register` - Create account

### 3. Dashboard (`/dashboard`)
- Two sections: "My Pools" / "Joined Pools"
- Pool cards with status badges
- "Create New Pool" button

### 4. Pool Detail (`/pool/[id]`)
**Header Card**:
- Pool name, game info, teams
- Status badge
- Share link + copy button

**Owner Controls** (conditional):
- Edit Settings (if open)
- Lock Board button
- Randomize Digits button (if locked, not numbered)
- Score Entry form (if numbered)

**Board Grid**:
- 10x10 interactive grid
- Axis labels with randomized digits (after numbered)
- Square states: unclaimed (green) / claimed (user) / mine (gold) / winner (gold glow)
- Click to claim (modal with quantity selector)
- Mobile: pinch/zoom, sticky headers

**Sidebar**:
- Leaderboard (user square counts)
- Winners list (per quarter)

### 5. Create/Edit Pool (`/pool/new`, `/pool/[id]/edit`)
- Form with validation
- Team name inputs
- Settings: price, max squares, visibility
- Date/time picker for game

---

## Edge Runtime Compatibility

### ✅ Safe Dependencies
- `next` - Full edge support
- `react`, `react-dom` - Edge compatible
- `zod` - Pure JS validation
- `bcryptjs` - Edge-compatible bcrypt
- `tailwindcss` - Build-time only
- `@types/*` - Build-time only

### ❌ Avoid
- `pg`, `mysql2` - Node drivers (use HTTP-based or SQLite)
- `node-sqlite3` - Node-specific (use Webflow binding)
- `express`, `koa` - Node servers (use Route Handlers)
- `fs`, `path` - Node APIs (use Web APIs)

### Web APIs Used
- `crypto.getRandomValues()` - Secure randomness
- `crypto.subtle` - JWT signing (HMAC-SHA256)
- `fetch` - HTTP requests
- `Request`, `Response` - Standard web objects

---

## Security Considerations

### Input Validation
- All API inputs validated with Zod schemas
- SQL injection prevented via parameterized queries
- XSS prevented via React's auto-escaping

### Authentication
- Passwords hashed with bcrypt (cost factor 10)
- JWTs signed with HS256, 24h expiry
- httpOnly cookies prevent JS access

### Authorization
- Owner-only actions enforced in API routes
- Pool visibility checked before data return
- Invite codes hashed in DB

### Race Conditions
- SQLite transactions for atomic claim operations
- UNIQUE constraint on (pool_id, row, col) prevents double-claim
- Optimistic locking via version field (future enhancement)

---

## Testing Strategy

### Unit Tests (Vitest)
- `lib/randomize.test.ts` - Digit generation uniqueness
- `lib/winners.test.ts` - Score calculation accuracy
- `lib/validation.test.ts` - Claim limit enforcement

### Integration Tests
- `api/pools.test.ts` - CRUD operations
- `api/squares.test.ts` - Claim/unclaim flows

### E2E Tests (Optional - Playwright)
- Full user flow: register → create pool → claim squares → randomize → enter scores

---

## Performance Considerations

### Edge Advantages
- Global distribution (low latency worldwide)
- SQLite co-location (microsecond DB access)
- Static asset CDN (ASSETS_PREFIX)

### Optimizations
- Server Components for non-interactive content (zero client JS)
- Client Components only for board interaction
- Image optimization via Next.js `<Image>`
- Route prefetching for dashboard → pool navigation

### Scalability
- Single pool: 100 squares + metadata (~10KB)
- 10,000 pools: ~100MB SQLite database (well within limits)
- Read-heavy workload (many viewers, few claimers) - ideal for edge caching

---

## Deployment Process

### Local Development
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

### Webflow Cloud Deployment

**1. GitHub Setup**
- Push code to GitHub repository
- Ensure `main` branch is default

**2. Webflow Cloud Connection**
- In Webflow: Sites → Add Site → Import from Git
- Connect GitHub account
- Select repository
- Webflow auto-detects Next.js framework
- Configure build settings:
  - Build command: `npm run build`
  - Output directory: `.next`
  - Install command: `npm install`

**3. Environment Variables**
- In Webflow project settings → Environment Variables:
  - `JWT_SECRET`: Generate strong secret (e.g., `openssl rand -base64 32`)
  - `NODE_ENV`: `production`

**4. Initial Deploy**
- Trigger deploy from Webflow dashboard
- Monitor build logs
- On success, visit provided URL

**5. Database Initialization**
- Visit `https://your-app.webflow.io/api/admin/init-db`
- Returns success message
- Schema is now created

**6. Subsequent Deploys**
- Push to `main` branch
- Webflow auto-deploys within ~2 minutes

---

## Limitations & Future Enhancements

### Current Limitations
1. **No Real-Time Updates**: Users must refresh to see new claims
   - Future: Add WebSocket or SSE for live board updates

2. **Basic Auth**: Email/password only
   - Future: Add OAuth (Google, Twitter)

3. **Manual Score Entry**: Owner types scores
   - Future: Integrate with sports data API (ESPN, The Odds API)

4. **No Payments**: Entry fees are informational only
   - Future: Stripe integration for paid pools

5. **Single Database**: All data in one SQLite file
   - Future: Shard by pool or migrate to distributed DB at scale

### Potential Enhancements
- **Email Notifications**: SendGrid/Resend for score updates
- **Pool Templates**: Save/reuse settings for recurring games
- **Advanced Analytics**: Historical win rates by square position
- **Mobile App**: React Native wrapper
- **Printable Boards**: PDF generation for office pools
- **Commissioner Tools**: Bulk claim/unclaim, payout calculator

---

## Monitoring & Observability

### Recommended (Webflow Cloud Compatible)
- **Logging**: Console logs visible in Webflow dashboard
- **Error Tracking**: Sentry (edge-compatible SDK)
- **Analytics**: Vercel Analytics or Plausible
- **Uptime**: Webflow provides built-in monitoring

### Key Metrics to Track
- Pool creation rate
- Square claim rate
- Average squares per pool
- Winner calculation latency
- Authentication failure rate

---

## Support & Maintenance

### Backup Strategy
- SQLite database is ephemeral in serverless edge
- **CRITICAL**: Webflow Cloud SQLite is durable but should be backed up
- Implement periodic export API: `GET /api/admin/export-db`
- Store exports in Cloudflare R2 or S3

### Rollback Plan
- Git revert to previous commit
- Redeploy via Webflow (automatic on push)
- Schema changes require migration script

### Debug Tools
- Webflow Cloud build logs (real-time)
- Edge function logs (console.log output)
- Local SQLite inspector (DB Browser for SQLite)

---

## Conclusion

This architecture delivers a production-ready Football Squares Pool MVP optimized for Webflow Cloud's edge environment. By leveraging Next.js App Router, SQLite bindings, and Web APIs, the app achieves:

- ✅ Zero-config deployment via GitHub
- ✅ Global low-latency distribution
- ✅ Cost-effective scaling
- ✅ Simple mental model (no external services)
- ✅ Type-safe end-to-end with TypeScript

The modular design allows for incremental enhancements (real-time, payments, OAuth) without architectural rewrites.
