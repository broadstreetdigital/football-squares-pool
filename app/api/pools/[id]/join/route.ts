/**
 * POST /api/pools/[id]/join
 * Join a private pool with invite code
 */

import { NextRequest, NextResponse } from 'next/server';
import { joinPoolSchema } from '@/lib/utils/validation';
import { findPoolById } from '@/lib/db/repositories/pools';
import { verifyPassword } from '@/lib/auth/password';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = joinPoolSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Get pool
    const pool = await findPoolById(id);

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    // Check if pool is private
    if (pool.visibility !== 'private') {
      return NextResponse.json(
        { error: 'Pool is public - no invite code needed' },
        { status: 400 }
      );
    }

    // Verify invite code
    if (!pool.invite_code_hash) {
      return NextResponse.json(
        { error: 'Pool has no invite code' },
        { status: 400 }
      );
    }

    // Normalize to uppercase for comparison (invite codes are generated in uppercase)
    const valid = await verifyPassword(
      validation.data.invite_code.toUpperCase(),
      pool.invite_code_hash
    );

    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 401 }
      );
    }

    // Return pool details (user is now authorized to view)
    return NextResponse.json({
      success: true,
      pool: {
        id: pool.id,
        name: pool.name,
        game_name: pool.game_name,
        game_time: pool.game_time,
        status: pool.status,
      },
    });
  } catch (error) {
    console.error('Join pool error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
