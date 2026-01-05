# Front-End Implementation Reference

This document provides implementation guidance for the remaining pages and components.

## Pages to Implement

### `app/login/page.tsx`
```typescript
- Server component
- Check if already logged in → redirect to /dashboard
- Render login form (client component)
- Form submits to /api/auth/login
- On success, redirect to /dashboard
```

### `app/register/page.tsx`
```typescript
- Similar to login page
- Form submits to /api/auth/register
- Validate password strength client-side
```

### `app/dashboard/page.tsx`
```typescript
- Server component, require auth
- Fetch owned pools and joined pools
- Two sections:
  - "My Pools" (created by user)
  - "Joined Pools" (user has claimed squares)
- Pool cards show: name, game, status badge, square count
- "Create New Pool" button → /pool/new
```

### `app/pool/new/page.tsx`
```typescript
- Server component, require auth
- Render CreatePoolForm component
- Form fields:
  - Pool name, Game name, Date/time
  - Home team, Away team
  - Entry fee (info), Square price
  - Max squares per user
  - Visibility (public/private)
  - Invite code (if private)
  - Rules (textarea)
- Submit to /api/pools
- On success, redirect to /pool/[id]
```

### `app/pool/[id]/page.tsx`
```typescript
- Server component
- Fetch pool, board state, winners
- Display:
  1. Header Card:
     - Pool info, game info, teams
     - Status badge
     - Share link with copy button
     - Owner controls (if user is owner):
       - Lock button (if open)
       - Randomize button (if locked, not numbered)
       - Score entry form (if numbered)
  2. Squares Board (SquaresBoard component)
  3. Sidebar:
     - Winners list (per quarter)
     - Leaderboard (user square counts)
```

### `app/pool/[id]/edit/page.tsx`
```typescript
- Server component, require owner
- Pre-fill form with pool data
- Submit to PATCH /api/pools/[id]
- Only allow if pool status is 'open'
```

## Components to Implement

### `components/LoginForm.tsx`
```typescript
'use client';

- Email and password fields
- Submit handler with fetch to /api/auth/login
- Error display
- Loading state
- Link to /register
```

### `components/PoolCard.tsx`
```typescript
- Display pool summary
- Props: pool, userSquareCount, isOwner
- Shows: name, game, teams, status badge, square count
- Click → navigate to /pool/[id]
```

### `components/StatusBadge.tsx`
```typescript
- Takes status: 'open' | 'locked' | 'numbered' | 'completed'
- Renders with appropriate color class
- OPEN → green, LOCKED → yellow, NUMBERED → blue, COMPLETED → purple
```

### `components/ScoreEntryForm.tsx`
```typescript
'use client';

- Form for owner to enter scores
- Fields: Q1, Q2, Q3, Q4, FINAL (each has Home/Away score)
- Submit to PUT /api/pools/[id]/scores
- Show current scores if already entered
- Editable
```

### `components/ShareLink.tsx`
```typescript
'use client';

- Display shareable URL
- Copy to clipboard button
- Success toast/message
```

### `components/WinnersList.tsx`
```typescript
- Display winners by quarter
- Shows: Bucket, Score, Winner name, Square position
- Gold styling for winners
```

## Styling Guidelines

### Colors
- Background: `bg-turf-gradient` with `bg-yard-pattern`
- Cards: `.stadium-card` class
- Primary actions: `.btn-primary` (gold)
- Secondary actions: `.btn-secondary` (white/transparent)
- Inputs: `.input-field` class

### Typography
- Headings: `font-display` (Teko)
- Body: `font-sans` (Inter)
- Scoreboard numbers: `scoreboard-text` class (LED green)

### Status Badges
- Use `.status-badge` base class
- Add `.status-{open|locked|numbered|completed}`

### Squares
- Unclaimed: `.square-unclaimed`
- Claimed: `.square-claimed`
- Mine: `.square-mine`
- Winner: `.square-winner` (gold glow animation)

## Forms Pattern

All forms should follow this pattern:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ExampleForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      field: formData.get('field') as string,
    };

    try {
      const res = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }

      const result = await res.json();
      router.push('/success-page');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <input name="field" className="input-field" required />

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
}
```

## Mobile Considerations

- Use responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Board should scroll horizontally on mobile
- Sticky axis headers for board
- Touch-friendly button sizes (min 44x44px)
- Use `sm:`, `md:`, `lg:` breakpoints

## Accessibility

- Use semantic HTML
- Add ARIA labels to interactive elements
- Ensure sufficient color contrast
- Keyboard navigation support
- Focus visible states

## Performance

- Use Server Components by default
- Only use Client Components when needed:
  - Forms with state
  - Interactive board
  - Copy-to-clipboard
- Minimize client bundle size
- Lazy load heavy components if needed
