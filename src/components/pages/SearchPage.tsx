'use client'

import { useState, useEffect } from 'react'
import { Search, Sparkles, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { RECHERCHES_POPULAIRES, ROUTES } from '@/constants'
import { createClient } from '@/utils/supabase/client'
import MichelinStar from '@/components/ui/MichelinStar'
import { Database } from '@/types/supabase'
import { staggerContainer, fadeSlideUp } from '@/lib/motion'

type MichelinAward = Database['public']['Tables']['michelin_awards']['Row']
type Restaurant = Database['public']['Tables']['restaurants']['Row'] & {
  michelin_awards: MichelinAward | null
}

type RecoTrait = Database['public']['Tables']['reco_traits']['Row']

const TRAIT_COLORS = ['bg-[#9B8B5A]', 'bg-[#8B3A3A]', 'bg-[#3A7A4A]', 'bg-[#3A5A8A]', 'bg-[#5A3A8A]', 'bg-[#8A5A3A]']

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [traitFilter, setTraitFilter] = useState<string | null>(null)
  const [traits, setTraits] = useState<RecoTrait[]>([])
  const [results, setResults] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('reco_traits').select('*').order('sort_order').limit(8).then(({ data }) => {
      setTraits(data ?? [])
    })
  }, [])

  useEffect(() => {
    if (!query.trim() && !traitFilter) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()

      if (traitFilter) {
        const { data } = await supabase
          .from('restaurants')
          .select('*, michelin_awards(*), restaurant_traits!inner(trait_code)')
          .eq('is_published', true)
          .eq('restaurant_traits.trait_code', traitFilter)
          .limit(20)
        setResults((data as Restaurant[]) ?? [])
      } else {
        const { data } = await supabase
          .from('restaurants')
          .select('*, michelin_awards(*)')
          .eq('is_published', true)
          .ilike('name', `%${query}%`)
          .limit(20)
        setResults((data as Restaurant[]) ?? [])
      }

      setLoading(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, traitFilter])

  return (
    <div className="flex flex-col pb-28 px-4 pt-6">

      <h1 className="text-michelin-black font-bold text-2xl mb-4">Rechercher</h1>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-michelin-gray" strokeWidth={1.5} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Restaurant, cuisine, quartier..."
          className="w-full bg-white rounded-xl pl-9 pr-4 py-3 text-sm text-michelin-black placeholder:text-michelin-gray/60 outline-none"
        />
      </div>

      {query.trim() || traitFilter ? (
        <section>
          {loading ? (
            <p className="text-michelin-gray text-sm">Recherche en cours…</p>
          ) : results.length === 0 ? (
            <p className="text-michelin-gray text-sm">Aucun résultat pour « {traitFilter ? (traits.find(t => t.code === traitFilter)?.label ?? traitFilter) : query} »</p>
          ) : (
            <motion.div
              key={query}
              className="flex flex-col divide-y divide-michelin-light-gray"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {results.map((r) => (
                <motion.div key={r.id} variants={fadeSlideUp} transition={{ duration: 0.3, ease: 'easeOut' }}>
                  <Link
                    href={`${ROUTES.RESTAURANTS}/${r.id}`}
                    className="flex items-center gap-3 py-3 hover:opacity-70 transition-opacity"
                  >
                    {r.main_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.main_image} alt={r.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 shrink-0" />
                    )}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      {r.michelin_awards && r.michelin_awards.stars > 0 && (
                        <div className="flex gap-0.5">
                          {Array.from({ length: r.michelin_awards.stars }, (_, i) => (
                            <MichelinStar key={i} size={9} />
                          ))}
                        </div>
                      )}
                      <p className="text-michelin-black text-sm font-semibold truncate">{r.name}</p>
                      <p className="text-michelin-gray text-xs truncate">{r.city}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      ) : (
        <>
          <section className="mb-7">
            <p className="text-michelin-black text-sm font-medium mb-3">Recherches populaires</p>
            <div className="flex flex-wrap gap-2">
              {RECHERCHES_POPULAIRES.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-4 py-1.5 rounded-full border border-michelin-black/20 text-sm text-michelin-black bg-white hover:border-michelin-black/50 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {traits.length > 0 && (
            <section className="mb-6">
              <p className="text-michelin-black font-bold text-lg mb-3">Explorer par trait</p>
              <div className="grid grid-cols-2 gap-3">
                {traits.map((trait, i) => (
                  <button
                    key={trait.code}
                    onClick={() => { setTraitFilter(trait.code); setQuery('') }}
                    className={`${TRAIT_COLORS[i % TRAIT_COLORS.length]} rounded-xl h-24 flex flex-col justify-end p-3 text-left hover:opacity-90 transition-opacity`}
                  >
                    <span className="text-white font-semibold text-sm">{trait.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <button className="flex items-center gap-2 text-michelin-black text-sm font-medium mb-6 self-start">
            <Sparkles size={16} strokeWidth={1.5} />
            Selon vos goûts
            <ArrowDown size={14} strokeWidth={2} />
          </button>
        </>
      )}


    </div>
  )
}
