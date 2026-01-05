# API Routes Implementation Reference

This document provides implementation details for the remaining API routes. Due to space constraints, implement these following the established patterns.

## Remaining Routes to Implement

### Pool Actions

#### `app/api/pools/[id]/lock/route.ts`
```typescript
POST /api/pools/[id]/lock
- Require auth, verify owner
- Update pool status from 'open' to 'locked'
- Log event
- Return updated pool
```

#### `app/api/pools/[id]/randomize/route.ts`
```typescript
POST /api/pools/[id]/randomize
- Require auth, verify owner
- Verify pool status is 'locked'
- Generate X and Y digits using generateRandomDigits()
- Create axis assignment
- Update pool status to 'numbered'
- Log event
- Return axis assignment
```

#### `app/api/pools/[id]/board/route.ts`
```typescript
GET /api/pools/[id]/board
- Get pool, squares, axis, scores
- If user authenticated, include their square count
- Return BoardState type
```

### Squares Management

#### `app/api/pools/[id]/squares/claim/route.ts`
```typescript
POST /api/pools/[id]/squares/claim
- Require auth
- Validate with claimSquaresSchema
- Use claimSquares() repository function (handles transactions)
- Log event
- Return claimed squares
```

#### `app/api/pools/[id]/squares/[row]/[col]/route.ts`
```typescript
DELETE /api/pools/[id]/squares/[row]/[col]
- Require auth
- Use unclaimSquare() repository function
- Log event
- Return success
```

### Scores & Winners

#### `app/api/pools/[id]/scores/route.ts`
```typescript
PUT /api/pools/[id]/scores
- Require auth, verify owner
- Validate with updateScoresSchema
- Verify pool status is 'numbered' or 'completed'
- Upsert each score
- Log event
- Return updated scores
```

#### `app/api/pools/[id]/winners/route.ts`
```typescript
GET /api/pools/[id]/winners
- Get pool, axis, scores, squares
- Verify pool is 'numbered' or 'completed'
- Use calculateAllWinners() to compute winners
- Return Winner[]
```

### Admin

#### `app/api/admin/init-db/route.ts`
```typescript
POST /api/admin/init-db
- Read schema.sql file
- Execute initializeSchema()
- Return success message
```

## Implementation Pattern

All routes follow this structure:

```typescript
export const runtime = 'edge'; // Important for Webflow Cloud

export async function METHOD(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth check (if needed)
    const session = await requireAuth();

    // 2. Extract params/body
    const { id } = await params;
    const body = await request.json();

    // 3. Validate input
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error, details }, { status: 400 });
    }

    // 4. Authorization check
    const pool = await findPoolById(id);
    if (pool.owner_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 5. Business logic
    // ... repository calls ...

    // 6. Log event
    await logEvent(poolId, userId, eventType, payload);

    // 7. Return result
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Error Handling

- 400: Validation errors
- 401: Not authenticated
- 403: Forbidden (not owner, etc.)
- 404: Resource not found
- 409: Conflict (duplicate, already claimed, etc.)
- 500: Internal server error

## Edge Runtime Compatibility

All routes must include:
```typescript
export const runtime = 'edge';
```

This ensures Webflow Cloud runs them in the edge environment.
