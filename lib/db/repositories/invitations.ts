/**
 * Pool Invitations repository - database operations for pool invitations
 */

import { query, queryOne, execute } from '../client';
import { generateId } from '@/lib/utils/id';

export interface PoolInvitation {
  id: string;
  pool_id: string;
  invited_email: string;
  invited_name: string;
  invited_by_user_id: string;
  invitation_token: string;
  claimed_squares_json: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: number;
  expires_at: number;
  accepted_at: number | null;
  created_user_id: string | null;
}

/**
 * Create a pool invitation
 */
export async function createPoolInvitation(params: {
  poolId: string;
  invitedEmail: string;
  invitedName: string;
  invitedByUserId: string;
  claimedSquares: Array<{ row: number; col: number }>;
}): Promise<PoolInvitation> {
  const id = generateId();
  const invitationToken = generateId() + generateId(); // Extra long token for security
  const createdAt = Date.now();
  const expiresAt = createdAt + (30 * 24 * 60 * 60 * 1000); // 30 days

  await execute(
    `INSERT INTO pool_invitations (
      id, pool_id, invited_email, invited_name, invited_by_user_id,
      invitation_token, claimed_squares_json, status, created_at, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      params.poolId,
      params.invitedEmail.toLowerCase(),
      params.invitedName,
      params.invitedByUserId,
      invitationToken,
      JSON.stringify(params.claimedSquares),
      'pending',
      createdAt,
      expiresAt,
    ]
  );

  const invitation = await queryOne<PoolInvitation>(
    'SELECT * FROM pool_invitations WHERE id = ?',
    [id]
  );

  if (!invitation) {
    throw new Error('Failed to create invitation');
  }

  return invitation;
}

/**
 * Find invitation by token
 */
export async function findInvitationByToken(
  token: string
): Promise<PoolInvitation | null> {
  const invitation = await queryOne<PoolInvitation>(
    'SELECT * FROM pool_invitations WHERE invitation_token = ?',
    [token]
  );

  return invitation || null;
}

/**
 * Find invitation by email and pool
 */
export async function findInvitationByEmailAndPool(
  email: string,
  poolId: string
): Promise<PoolInvitation | null> {
  const invitation = await queryOne<PoolInvitation>(
    'SELECT * FROM pool_invitations WHERE invited_email = ? AND pool_id = ? AND status = ?',
    [email.toLowerCase(), poolId, 'pending']
  );

  return invitation || null;
}

/**
 * Mark invitation as accepted
 */
export async function acceptInvitation(
  invitationId: string,
  userId: string
): Promise<void> {
  await execute(
    `UPDATE pool_invitations
     SET status = ?, accepted_at = ?, created_user_id = ?
     WHERE id = ?`,
    ['accepted', Date.now(), userId, invitationId]
  );
}

/**
 * Get all invitations for a pool
 */
export async function getPoolInvitations(poolId: string): Promise<PoolInvitation[]> {
  return await query<PoolInvitation>(
    'SELECT * FROM pool_invitations WHERE pool_id = ? ORDER BY created_at DESC',
    [poolId]
  );
}

/**
 * Check if invitation is still valid
 */
export function isInvitationValid(invitation: PoolInvitation): boolean {
  return (
    invitation.status === 'pending' &&
    invitation.expires_at > Date.now()
  );
}
