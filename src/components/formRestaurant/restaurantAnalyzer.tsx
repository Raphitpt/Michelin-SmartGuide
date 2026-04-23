'use client'

import { useActionState, useEffect, useState } from 'react'
import { analyse } from './analyse'

export type Trait = {
  id: string
  code: string
  label: string
}

export type AnalyseState = {
  contexte: any
  restaurants: { name: string }[]
  reco_traits: Record<string, Trait[]>
}

export default function RestaurantAnalyzer({
  onAnalyseComplete,
}: {
  onAnalyseComplete: (data: Record<string, Trait[]>) => void
}) {
  const [state, action, isPending] = useActionState<
    AnalyseState,
    FormData
  >(
    async (_prevState, formData) => {
      return await analyse(formData)
    },
    {
      contexte: null,
      reco_traits: {},
      restaurants: [],
    }
  )

  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (state.restaurants?.length > 0 && !inputValue) {
      setInputValue(state.restaurants[0].name)
    }
  }, [state.restaurants])

  useEffect(() => {
    if (Object.keys(state.reco_traits).length > 0) {
      onAnalyseComplete(state.reco_traits)
    }
  }, [state.reco_traits, onAnalyseComplete])

  return (
    <div className="max-w-md mx-auto p-6">
      <form action={action}>
        <div className="relative">
          <input
            name="texte"
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nom du restaurant..."
            required
            className="w-full p-3 border rounded-lg"
          />

          <button
            type="submit"
            disabled={isPending}
            className="absolute right-2 top-2 bg-blue-600 text-white px-3 py-1 rounded"
          >
            {isPending ? 'Analyse...' : 'Analyser'}
          </button>
        </div>
      </form>
    </div>
  )
}