'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow"
    >
      <ArrowLeft size={16} className="text-michelin-black" />
    </button>
  )
}
