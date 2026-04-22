import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/server'

const ETOILES_SLUGS = ['ONE_STAR', 'TWO_STARS', 'THREE_STARS']

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const userId = searchParams.get('userId')
  const filter = searchParams.get('filter')

  if (!userId || !filter) {
    return NextResponse.json({ error: 'userId and filter are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 1. Get user's archetype
  const { data: tasteProfile } = await supabase
    .from('user_taste_profiles')
    .select('archetype_id')
    .eq('user_id', userId)
    .single()

  const archetypeId = tasteProfile?.archetype_id ?? null

  // 2. Get archetype weights (trait_code → weight)
  let weights: Record<string, number> = {}
  if (archetypeId) {
    const { data: weightRows } = await supabase
      .from('reco_archetype_weights')
      .select('trait_code, weight')
      .eq('archetype_id', archetypeId)

    weights = Object.fromEntries((weightRows ?? []).map((r) => [r.trait_code, r.weight]))
  }

  // 3. Get michelin_awards to map id → slug
  const { data: awards } = await supabase
    .from('michelin_awards')
    .select('id, slug')

  const awardSlugById: Record<string, string> = Object.fromEntries(
    (awards ?? []).map((a) => [a.id, a.slug])
  )

  // 4. Fetch restaurants from view
  let query = supabase
    .from('v_restaurant_reco')
    .select('*')
    .not('main_image', 'is', null)

  if (filter === 'ETOILES') {
    const etoilesIds = (awards ?? [])
      .filter((a) => ETOILES_SLUGS.includes(a.slug))
      .map((a) => a.id)
    query = query.in('michelin_award_id', etoilesIds)
  } else if (filter === 'BIB_GOURMAND') {
    const bibId = (awards ?? []).find((a) => a.slug === 'BIB_GOURMAND')?.id
    if (bibId) {
      query = query.eq('michelin_award_id', bibId)
    }
  } else if (filter === 'TERRASSE') {
    query = query.contains('trait_codes', ['terrasse'])
  }

  const { data: restaurants } = await query.limit(50)

  if (!restaurants?.length) {
    return NextResponse.json({ restaurants: [] })
  }

  // 5. Score and sort
  const scored = restaurants.map((r) => {
    const score = (r.trait_codes ?? []).reduce(
      (sum, code) => sum + (weights[code] ?? 0),
      0
    )
    return { ...r, award_slug: r.michelin_award_id ? (awardSlugById[r.michelin_award_id] ?? null) : null, _score: score }
  })

  scored.sort((a, b) => b._score - a._score)

  return NextResponse.json({ restaurants: scored.slice(0, 20) })
}
