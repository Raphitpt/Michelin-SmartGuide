'use client'

import RestaurantAnalyzer from './restaurantAnalyzer'
import TagSelector from './TagSelector'
import { useEffect, useState } from 'react'

export default function FormClient({ questions }: any) {
  const [recoTraits, setRecoTraits] = useState<any>({})
  const [answers, setAnswers] = useState<Record<string, any[]>>({})
  const [isPending, setIsPending] = useState(false)

  // =====================
  // 🔥 INIT depuis IA
  // =====================
  useEffect(() => {
    const initial: Record<string, any[]> = {}

    Object.entries(recoTraits).forEach(([dimensionId, data]: any) => {
      initial[`param-${dimensionId}`] = data.selected || []
    })

    setAnswers((prev) => ({
      ...prev,
      ...initial,
    }))
  }, [recoTraits])

  // =====================
  // UPDATE ANSWER
  // =====================
  const handleChange = (key: string, value: any[]) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // =====================
  // BUILD PAYLOAD CLEAN
  // =====================
  const buildPayload = () => {
    return questions.map((q: any) => ({
      questionId: q.id,
      label: q.nom,
      max: q.max_tags,
      selected: answers[`param-${q.id}`] || [],
    }))
  }
  // =====================
  // RESET FORM
  // =====================
  const resetForm = () => {
  setAnswers({})
  setRecoTraits({})
}
  // =====================
  // SUBMIT
  // =====================
 const handleSubmit = (e: any) => {
  e.preventDefault()
  setIsPending(true)

  const payload = buildPayload()

  console.log('📦 JSON FORMULAIRE :')
  console.log(JSON.stringify(payload, null, 2))

  setTimeout(() => {
    setIsPending(false)
    resetForm()
    alert('Formulaire soumis avec succès !')
  }, 500)
}
  // =====================
  // UI
  // =====================
  return (
    <div className="px-6 py-24 lg:px-8">
      {/* HEADER */}
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold text-gray-900">
          Formulaire
        </h2>
      </div>

      {/* IA ANALYZER */}
      <RestaurantAnalyzer onAnalyseComplete={setRecoTraits} />

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-16 max-w-xl space-y-6"
      >
        {questions?.map((q: any) => {
          const dimData = recoTraits[q.id] || {
            selected: [],
            available: q.tags || [],
          }

          return (
            <TagSelector
              key={q.id}
              label={q.nom}
              max={q.max_tags}
              selected={
                answers[`param-${q.id}`] ||
                dimData.selected
              }
              options={dimData.available}
              onChange={(val: any) =>
                handleChange(`param-${q.id}`, val)
              }
            />
          )
        })}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 text-white py-2 rounded-md"
        >
          {isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}