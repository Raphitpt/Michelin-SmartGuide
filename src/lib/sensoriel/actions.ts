'use server'

import { cookies } from 'next/headers'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import type { ScoreVector } from './scoring'

export async function createSwipeSession(userId: string): Promise<string> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('swipe_sessions')
    .insert({ user_id: userId, completed: false })
    .select('id')
    .single()
  if (error || !data) throw new Error(`Failed to create swipe session: ${error?.message} | ${error?.code} | ${error?.details}`)
  return data.id
}

export async function saveSwipe({
  sessionId,
  userId,
  restaurantId,
  liked,
}: {
  sessionId: string
  userId: string
  restaurantId: string
  liked: boolean
}): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('user_swipes').insert({
    session_id: sessionId,
    user_id: userId,
    restaurant_id: restaurantId,
    liked,
  })
  if (error) throw new Error(`Failed to save swipe: ${error.message}`)
}

export async function saveTasteProfile({
  userId,
  sessionId,
  archetypeId,
  archetypeScore,
  scoreVector,
  swipeCount,
}: {
  userId: string
  sessionId: string
  archetypeId: string
  archetypeScore: number
  scoreVector: ScoreVector
  swipeCount: number
}): Promise<void> {
  const supabase = createAdminClient()

  await supabase
    .from('swipe_sessions')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', sessionId)

  const { error } = await supabase.from('user_taste_profiles').upsert({
    user_id: userId,
    archetype_id: archetypeId,
    archetype_score: archetypeScore,
    score_vector: scoreVector as Record<string, number>,
    swipe_count: swipeCount,
    last_session_id: sessionId,
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(`Failed to save taste profile: ${error.message}`)
}
