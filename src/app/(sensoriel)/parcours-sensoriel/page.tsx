// src/app/(sensoriel)/parcours-sensoriel/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import IntroScreen from '@/components/sensoriel/IntroScreen'
import SwiperScreen from '@/components/sensoriel/SwiperScreen'
import ResultScreen from '@/components/sensoriel/ResultScreen'
import { fetchRestaurantsForSwipe, fetchArchetypesAndWeights } from '@/lib/sensoriel/queries'
import { buildScoreVector, computeArchetypeScores, pickBestArchetype, getTopTags } from '@/lib/sensoriel/scoring'
import { createSwipeSession, saveSwipe, saveTasteProfile } from '@/lib/sensoriel/actions'
import type { RestaurantForSwipe } from '@/lib/sensoriel/queries'

type Step = 'intro' | 'swipe' | 'result'

type SwipeRecord = {
  restaurantId: string
  liked: boolean
  traitCodes: string[]
}

type ResultData = {
  archetypeName: string
  archetypeDescription: string
  scorePct: number
  topTags: string[]
}

export default function ParcoursSensorielPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>('intro')
  const [restaurants, setRestaurants] = useState<RestaurantForSwipe[]>([])
  const [result, setResult] = useState<ResultData | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    fetchRestaurantsForSwipe().then(setRestaurants)
  }, [])

  async function handleStart() {
    if (!user) {
      router.push('/login')
      return
    }
    try {
      const id = await createSwipeSession(user.id)
      setSessionId(id)
    } catch {
      // session non critique
    }
    setStep('swipe')
  }

  async function handleComplete(swipes: SwipeRecord[]) {
    const { archetypes, weights, traitLabels } = await fetchArchetypesAndWeights()

    const vector = buildScoreVector(swipes)
    const archetypeScores = computeArchetypeScores(vector, weights)
    const { archetype, scorePct } = pickBestArchetype(archetypeScores, archetypes)
    const topTags = getTopTags(vector, traitLabels, 3)

    if (user && sessionId) {
      try {
        for (const swipe of swipes) {
          await saveSwipe({
            sessionId,
            userId: user.id,
            restaurantId: swipe.restaurantId,
            liked: swipe.liked,
          })
        }
        await saveTasteProfile({
          userId: user.id,
          sessionId,
          archetypeId: archetype.id,
          archetypeScore: scorePct,
          scoreVector: vector,
          swipeCount: swipes.length,
        })
      } catch {
        // erreur silencieuse
      }
    }

    setResult({
      archetypeName: archetype.nom,
      archetypeDescription: archetype.description,
      scorePct,
      topTags,
    })
    setStep('result')
  }

  if (step === 'intro') return <IntroScreen onStart={handleStart} />
  if (step === 'swipe') return <SwiperScreen restaurants={restaurants} onComplete={handleComplete} />
  if (step === 'result' && result) {
    return (
      <ResultScreen
        archetypeName={result.archetypeName}
        archetypeDescription={result.archetypeDescription}
        scorePct={result.scorePct}
        topTags={result.topTags}
      />
    )
  }
  return null
}
