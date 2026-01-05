/**
 * Event log repository - audit trail
 */

import { query, execute } from '../client';
import { EventLog } from '../types';
import { generateId } from '@/lib/utils/id';

export type EventType =
  | 'pool_created'
  | 'pool_updated'
  | 'pool_locked'
  | 'pool_unlocked'
  | 'pool_randomized'
  | 'squares_claimed'
  | 'square_unclaimed'
  | 'score_updated'
  | 'pool_completed';

export async function logEvent(
  poolId: string,
  actorUserId: string | null,
  type: EventType,
  payload: Record<string, any>
): Promise<EventLog> {
  const id = generateId();
  const createdAt = Date.now();

  execute(
    `INSERT INTO event_log (id, pool_id, actor_user_id, type, payload_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, poolId, actorUserId, type, JSON.stringify(payload), createdAt]
  );

  return {
    id,
    pool_id: poolId,
    actor_user_id: actorUserId,
    type,
    payload_json: JSON.stringify(payload),
    created_at: createdAt,
  };
}

export async function getPoolEvents(
  poolId: string,
  limit = 100
): Promise<EventLog[]> {
  return query<EventLog>(
    'SELECT * FROM event_log WHERE pool_id = ? ORDER BY created_at DESC LIMIT ?',
    [poolId, limit]
  );
}

export async function getEventsByType(
  type: EventType,
  limit = 100
): Promise<EventLog[]> {
  return query<EventLog>(
    'SELECT * FROM event_log WHERE type = ? ORDER BY created_at DESC LIMIT ?',
    [type, limit]
  );
}
