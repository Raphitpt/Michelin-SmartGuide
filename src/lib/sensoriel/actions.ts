'use server'

import { createAdminClient } from '@/utils/supabase/server'
import type { ScoreVector } from './scoring'
import { buildScoreVector, computeArchetypeScores, pickBestArchetype } from './scoring'

export async function updateTasteProfileFromSwipe({
  userId,
  restaurantId,
  liked,
}: {
  userId: string
  restaurantId: string
  liked: boolean
}): Promise<void> {
  const supabase = createAdminClient()

  // Récupère les traits du restaurant
  const { data: traitRows } = await supabase
    .from('restaurant_traits')
    .select('trait_code')
    .eq('restaurant_id', restaurantId)

  if (!traitRows || traitRows.length === 0) return

  const traitCodes = traitRows.map(t => t.trait_code)

  // Charge le profil existant
  const { data: existing } = await supabase
    .from('user_taste_profiles')
    .select('score_vector, swipe_count, archetype_id, archetype_score')
    .eq('user_id', userId)
    .maybeSingle()

  const currentVector: ScoreVector = (existing?.score_vector as ScoreVector) ?? {}
  const currentSwipeCount = existing?.swipe_count ?? 0

  // Applique le delta : +2 si aimé, -1 si pas aimé
  const delta = liked ? 2 : -1
  const newVector: ScoreVector = { ...currentVector }
  for (const code of traitCodes) {
    newVector[code] = (newVector[code] ?? 0) + delta
  }

  // Recalcule l'archétype
  const [{ data: archetypes }, { data: weights }] = await Promise.all([
    supabase.from('reco_archetypes').select('id, nom, description'),
    supabase.from('reco_archetype_weights').select('archetype_id, trait_code, weight'),
  ])

  const archetypeScores = computeArchetypeScores(newVector, weights ?? [])
  const { archetype, scorePct } = pickBestArchetype(archetypeScores, archetypes ?? [])

  if (!archetype) return

  await supabase.from('user_taste_profiles').upsert(
    {
      user_id: userId,
      archetype_id: archetype.id,
      archetype_score: scorePct,
      score_vector: newVector as Record<string, number>,
      swipe_count: currentSwipeCount + 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
}

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
  const { error } = await supabase.from('user_swipes').upsert(
    {
      session_id: sessionId,
      user_id: userId,
      restaurant_id: restaurantId,
      liked,
      swiped_at: new Date().toISOString(),
    },
    {
      onConflict: 'session_id,restaurant_id',
    }
  )
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

  const { error: sessionError } = await supabase
    .from('swipe_sessions')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (sessionError) throw new Error(`Failed to complete swipe session: ${sessionError.message}`)

  const { error } = await supabase.from('user_taste_profiles').upsert(
    {
      user_id: userId,
      archetype_id: archetypeId,
      archetype_score: archetypeScore,
      score_vector: scoreVector as Record<string, number>,
      swipe_count: swipeCount,
      last_session_id: sessionId,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  )
  if (error) throw new Error(`Failed to save taste profile: ${error.message}`)
}
