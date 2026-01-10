/**
 * POST /api/pools - Create a new pool
 * GET /api/pools - List public pools
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { createPoolSchema } from '@/lib/utils/validation';
import { createPool, getPublicPools } from '@/lib/db/repositories/pools';
import { logEvent } from '@/lib/db/repositories/events';
import { hashPassword } from '@/lib/auth/password';
import { generateInviteCode } from '@/lib/utils/id';


export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    // Validate input
    const validation = createPoolSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Generate invite code hash if private
    let inviteCodeHash: string | undefined;
    let inviteCode: string | undefined;

    if (data.visibility === 'private') {
      inviteCode = data.invite_code || generateInviteCode();
      inviteCodeHash = await hashPassword(inviteCode);
    }

    // Create pool
    const pool = await createPool({
      owner_id: session.user.id,
      name: data.name,
      game_name: data.game_name,
      game_time: data.game_time,
      entry_fee_info: data.entry_fee_info,
      square_price: data.square_price,
      max_squares_per_user: data.max_squares_per_user,
      visibility: data.visibility,
      invite_code: inviteCode,
      invite_code_hash: inviteCodeHash,
      rules: data.rules,
      home_team: data.home_team,
      away_team: data.away_team,
    });

    // Log event (non-critical, don't fail if this errors)
    try {
      await logEvent(pool.id, session.user.id, 'pool_created', {
        pool_name: pool.name,
        game_name: pool.game_name,
      });
    } catch (logError) {
      console.error('Failed to log event (non-critical):', logError);
    }

    return NextResponse.json(
      {
        pool,
        invite_code: inviteCode, // Return invite code if generated
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create pool error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const pools = await getPublicPools(limit, offset);

    return NextResponse.json({ pools });
  } catch (error) {
    console.error('List pools error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
