// src/lib/sensoriel/scoring.ts

export type ScoreVector = Record<string, number>

export type SwipeResult = {
  restaurantId: string
  liked: boolean
  traitCodes: string[]
}

export type ArchetypeWeight = {
  archetype_id: string
  trait_code: string
  weight: number
}

export type Archetype = {
  id: string
  nom: string
  description: string
}

export function buildScoreVector(swipes: SwipeResult[]): ScoreVector {
  const vector: ScoreVector = {}
  for (const swipe of swipes) {
    const delta = swipe.liked ? 2 : -1
    for (const code of swipe.traitCodes) {
      vector[code] = (vector[code] ?? 0) + delta
    }
  }
  return vector
}

export function computeArchetypeScores(
  vector: ScoreVector,
  weights: ArchetypeWeight[]
): Record<string, number> {
  const scores: Record<string, number> = {}
  for (const { archetype_id, trait_code, weight } of weights) {
    const traitScore = vector[trait_code] ?? 0
    scores[archetype_id] = (scores[archetype_id] ?? 0) + traitScore * weight
  }
  return scores
}

export function pickBestArchetype(
  archetypeScores: Record<string, number>,
  archetypes: Archetype[]
): { archetype: Archetype | null; scorePct: number } {
  if (archetypes.length === 0) {
    return { archetype: null, scorePct: 0 }
  }

  let bestId = archetypes[0].id
  let bestScore = archetypeScores[bestId] ?? 0

  for (const arch of archetypes) {
    const s = archetypeScores[arch.id] ?? 0
    if (s > bestScore) {
      bestScore = s
      bestId = arch.id
    }
  }

  const allScores = archetypes.map(a => archetypeScores[a.id] ?? 0)
  const maxPossible = Math.max(...allScores, 1)
  const scorePct = Math.max(0, Math.min(100, Math.round((bestScore / maxPossible) * 100)))

  const archetype = archetypes.find(a => a.id === bestId) ?? null
  return { archetype, scorePct }
}

export function getTopTags(
  vector: ScoreVector,
  traitLabels: Record<string, string>,
  topN = 3
): string[] {
  return Object.entries(vector)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([code]) => traitLabels[code] ?? code)
}
