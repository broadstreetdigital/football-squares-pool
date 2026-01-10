# Security Audit Report
**Date**: 2026-01-10
**Application**: Football Squares Pool MVP
**Platform**: Vercel + Turso Database

## Executive Summary

This security audit identifies critical and moderate security issues that should be addressed before production deployment. The application demonstrates good security practices in authentication and authorization, but has critical vulnerabilities that require immediate attention.

---

## 🔴 CRITICAL ISSUES (Must Fix Before Production)

### 1. Public Admin Endpoint - Database Initialization
**Location**: `/app/api/admin/init-db/route.ts`
**Severity**: CRITICAL
**Risk**: Anyone can reinitialize or drop the database

**Issue**:
```typescript
export async function GET() {
  return initDb();
}

export async function POST() {
  return initDb();
}
```

The `/api/admin/init-db` endpoint is completely public with no authentication. Any visitor can:
- Initialize the database schema
- Potentially cause data loss or corruption
- Execute arbitrary SQL if the endpoint is modified

**Recommendation**:
```typescript
import { requireAuth } from '@/lib/auth/session';

export async function POST() {
  // Option 1: Require authentication + environment check
  const session = await requireAuth();

  // Only allow in development or with special admin role
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production' },
      { status: 403 }
    );
  }

  return initDb();
}

// Remove GET method - only POST should be allowed
```

**Alternative**: Use Turso CLI or migration scripts instead of an HTTP endpoint.

---

### 2. SQL Injection Vulnerability in Pool Creation
**Location**: `/lib/db/repositories/pools.ts:71-77`
**Severity**: CRITICAL
**Risk**: SQL injection through pool ID

**Issue**:
```typescript
// Line 71-72 - Direct string interpolation
for (let row = 0; row < 10; row++) {
  for (let col = 0; col < 10; col++) {
    squareValues.push(`('${id}', ${row}, ${col}, NULL, NULL, NULL, NULL)`);
  }
}

await execute(
  `INSERT INTO squares (pool_id, row, col, claimed_by_user_id, claimed_display_name, claimed_email, claimed_at)
   VALUES ${squareValues.join(', ')}`
);
```

While `id` is generated internally via `generateId()`, this pattern is vulnerable if the function is ever modified or if similar patterns are copied elsewhere.

**Recommendation**:
```typescript
// Use proper parameterized queries
const squareInserts = [];
const squareParams = [];

for (let row = 0; row < 10; row++) {
  for (let col = 0; col < 10; col++) {
    squareInserts.push('(?, ?, ?, NULL, NULL, NULL, NULL)');
    squareParams.push(id, row, col);
  }
}

await execute(
  `INSERT INTO squares (pool_id, row, col, claimed_by_user_id, claimed_display_name, claimed_email, claimed_at)
   VALUES ${squareInserts.join(', ')}`,
  squareParams
);
```

---

## 🟠 HIGH PRIORITY ISSUES (Should Fix Soon)

### 3. No Rate Limiting
**Location**: All API endpoints
**Severity**: HIGH
**Risk**: Brute force attacks, DoS, credential stuffing

**Issue**:
- No rate limiting on authentication endpoints (`/api/auth/login`, `/api/auth/register`)
- No rate limiting on pool creation or square claiming
- Attackers can:
  - Brute force passwords
  - Create spam pools
  - Claim squares rapidly to gain advantage

**Recommendation**:
Implement rate limiting using Vercel's Edge Config or a service like Upstash Redis:

```typescript
// Example using a middleware or helper
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

// In auth endpoints
const identifier = request.headers.get('x-forwarded-for') ?? 'anonymous';
const { success } = await ratelimit.limit(identifier);

if (!success) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429 }
  );
}
```

**Recommended limits**:
- `/api/auth/login`: 5 requests per 15 minutes per IP
- `/api/auth/register`: 3 requests per hour per IP
- `/api/pools` (POST): 10 requests per hour per user
- `/api/pools/[id]/squares/claim`: 50 requests per hour per user

---

### 4. Missing CSRF Protection
**Location**: All state-changing endpoints
**Severity**: HIGH
**Risk**: Cross-Site Request Forgery attacks

**Issue**:
While `sameSite: 'strict'` cookies provide some protection, there's no CSRF token validation for state-changing operations.

**Recommendation**:
Add CSRF token validation for all POST/PUT/PATCH/DELETE requests:

```typescript
// lib/auth/csrf.ts
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

export function validateCSRFToken(token: string, expected: string): boolean {
  return token === expected;
}

// Store CSRF token in session or separate cookie
// Validate on each state-changing request
```

Or use Next.js middleware with a CSRF library.

---

### 5. Weak JWT Secret in Development
**Location**: `/lib/auth/jwt.ts:13`
**Severity**: HIGH (in production)
**Risk**: Token forgery if weak secret is used

**Issue**:
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
```

The fallback secret is weak and could be used in production if environment variable is not set.

**Recommendation**:
```typescript
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    'JWT_SECRET environment variable must be set and at least 32 characters long. ' +
    'Generate one with: openssl rand -base64 32'
  );
}
```

This ensures the application fails to start rather than using a weak secret.

---

## 🟡 MODERATE PRIORITY ISSUES

### 6. No Account Lockout Mechanism
**Location**: `/app/api/auth/login/route.ts`
**Severity**: MODERATE
**Risk**: Prolonged brute force attacks

**Issue**:
After failed login attempts, there's no temporary account lockout.

**Recommendation**:
- Track failed login attempts (store in database or Redis)
- Lock account for 15-30 minutes after 5 failed attempts
- Send email notification to user about failed attempts
- Implement CAPTCHA after 3 failed attempts

---

### 7. Timing Attack on Login
**Location**: `/app/api/auth/login/route.ts:31-36`
**Severity**: MODERATE
**Risk**: Username enumeration

**Issue**:
```typescript
const user = await findUserByEmail(email);
if (!user) {
  return NextResponse.json(
    { error: 'Invalid credentials' },
    { status: 401 }
  );
}
```

Different code paths for "user not found" vs "wrong password" may have different response times, allowing attackers to enumerate valid email addresses.

**Recommendation**:
```typescript
const user = await findUserByEmail(email);

// Always hash password, even if user doesn't exist
const passwordToCheck = password;
const hashToCompare = user?.password_hash ||
  '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Dummy hash

const valid = await verifyPassword(passwordToCheck, hashToCompare);

if (!user || !valid) {
  return NextResponse.json(
    { error: 'Invalid credentials' },
    { status: 401 }
  );
}
```

---

### 8. Console Error Logging May Expose Sensitive Data
**Location**: Multiple API routes
**Severity**: MODERATE
**Risk**: Sensitive data in logs

**Issue**:
```typescript
console.error('Login error:', error);
```

Error objects may contain sensitive data (passwords, tokens, database details).

**Recommendation**:
```typescript
// Use structured logging
console.error('Login error:', {
  message: error instanceof Error ? error.message : 'Unknown error',
  // Don't log error.stack or full error object
});

// Or use a logging library with redaction
import { logger } from '@/lib/logger';
logger.error('Login error', {
  error: error instanceof Error ? error.message : 'Unknown'
});
```

---

### 9. No Input Sanitization for Display Names
**Location**: Square claiming endpoints
**Severity**: MODERATE
**Risk**: Stored XSS through display names

**Issue**:
Display names are stored and rendered without explicit sanitization. While React auto-escapes by default, it's good practice to sanitize inputs.

**Recommendation**:
```typescript
import DOMPurify from 'isomorphic-dompurify';

// In validation schema
display_name: z.string()
  .min(1)
  .max(100)
  .transform(val => DOMPurify.sanitize(val, { ALLOWED_TAGS: [] }))
```

---

### 10. Missing Email Verification
**Location**: `/app/api/auth/register/route.ts`
**Severity**: MODERATE
**Risk**: Fake accounts, spam

**Issue**:
Users can register without email verification. This allows:
- Creating accounts with fake emails
- Email address enumeration
- Spam pool creation

**Recommendation**:
- Send verification email after registration
- Mark account as unverified until confirmed
- Limit unverified accounts (can't create pools, etc.)
- Expire unverified accounts after 24-48 hours

---

## ✅ GOOD SECURITY PRACTICES (Keep These)

### 1. Password Hashing ✓
- Uses bcrypt with appropriate salt rounds (10)
- Passwords never logged or exposed

### 2. JWT Implementation ✓
- Uses Web Crypto API with HMAC-SHA256
- Proper expiry checking (24 hours)
- Signature verification

### 3. Cookie Security ✓
```typescript
{
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  maxAge: 24 * 60 * 60,
  path: '/',
}
```

### 4. Input Validation ✓
- Comprehensive Zod schemas for all inputs
- Type-safe validation
- Proper error messages

### 5. SQL Parameterization ✓
- Most queries use parameterized statements
- Protection against SQL injection (except issue #2)

### 6. Authorization Checks ✓
- Owner-only operations properly validated
- Pool visibility respected
- User ownership verified before updates

### 7. Security Headers ✓
```typescript
// next.config.js
{
  'Strict-Transport-Security': 'max-age=63072000',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'origin-when-cross-origin'
}
```

### 8. Transaction Safety ✓
- Critical operations wrapped in transactions
- Proper rollback on errors
- Race condition prevention in square claiming

---

## 📋 ADDITIONAL RECOMMENDATIONS

### 11. Environment Variable Validation
**Priority**: MODERATE

Add startup validation for all required environment variables:

```typescript
// lib/config/validate.ts
const requiredEnvVars = [
  'JWT_SECRET',
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Validate JWT_SECRET strength
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}
```

### 12. Add Security Headers to API Routes
**Priority**: LOW

While headers are set globally, explicitly set them for API routes:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
  }

  return response;
}
```

### 13. Implement Audit Logging
**Priority**: LOW

The event log table exists but could be enhanced:

```typescript
// Log all security-relevant events:
- Failed login attempts
- Password changes (when implemented)
- Admin actions
- Multiple square claims in short time
- Unusual access patterns
```

### 14. Add Content Security Policy
**Priority**: LOW

Add CSP header to prevent XSS:

```typescript
// next.config.js - headers
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://your-turso-db.turso.io"
  ].join('; ')
}
```

---

## 🎯 PRIORITY ACTION PLAN

### Before Production Deployment:
1. **FIX CRITICAL** - Secure or remove `/api/admin/init-db` endpoint
2. **FIX CRITICAL** - Fix SQL injection in pool creation
3. **ADD HIGH** - Implement rate limiting on auth endpoints
4. **ADD HIGH** - Validate JWT_SECRET strength at startup
5. **VERIFY** - Ensure all environment variables are set in Vercel

### Phase 2 (First Week):
6. Add CSRF protection
7. Implement account lockout
8. Fix timing attack on login
9. Add proper error logging (no sensitive data)

### Phase 3 (First Month):
10. Add email verification
11. Implement audit logging alerts
12. Add CSP headers
13. Add monitoring and alerting for security events

---

## 🔒 DEPLOYMENT CHECKLIST

Before deploying to production, verify:

- [ ] `/api/admin/init-db` is secured or removed
- [ ] SQL injection vulnerability fixed
- [ ] `JWT_SECRET` is set and >= 32 characters
- [ ] `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set
- [ ] Rate limiting is configured
- [ ] Security headers are enabled
- [ ] HTTPS is enforced (Vercel does this automatically)
- [ ] Database backups are configured (Turso automatic backups)
- [ ] Error logging doesn't expose sensitive data
- [ ] All environment variables are in Vercel dashboard

---

## 📚 SECURITY RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Vercel Security](https://vercel.com/docs/security)
- [Turso Security](https://turso.tech/docs/security)

---

## 📝 NOTES

This audit was performed on 2026-01-10 based on code review. A penetration test is recommended before handling real money or sensitive user data.

**Reviewed Files**:
- All `/app/api/**/*.ts` endpoints
- Authentication and authorization logic
- Database queries and repositories
- Configuration files (next.config.js, vercel.json)
- Environment variable usage

**Not Reviewed**:
- Frontend security (XSS in React components)
- Third-party dependencies for known vulnerabilities
- Infrastructure security (Vercel/Turso platforms)
- Physical security or social engineering vectors
