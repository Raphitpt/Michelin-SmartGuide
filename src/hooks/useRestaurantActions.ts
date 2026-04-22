'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useRestaurantActions(userId: string | null | undefined, restaurantId: string) {
  const [liked, setLiked] = useState(false)
  const [visited, setVisited] = useState(false)
  const [swipeId, setSwipeId] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()

    Promise.all([
      supabase
        .from('user_swipes')
        .select('id, liked')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .maybeSingle(),
      supabase
        .from('user_visited_restaurants')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .maybeSingle(),
    ]).then(([{ data: swipe }, { data: visit }]) => {
      setLiked(swipe?.liked ?? false)
      setSwipeId(swipe?.id ?? null)
      setVisited(!!visit)
    })
  }, [userId, restaurantId])

  const toggleLike = useCallback(async () => {
    if (!userId) return
    const supabase = createClient()
    const next = !liked
    setLiked(next)

    if (swipeId) {
      await supabase.from('user_swipes').update({ liked: next }).eq('id', swipeId)
    } else {
      const { data } = await supabase
        .from('user_swipes')
        .insert({ user_id: userId, restaurant_id: restaurantId, liked: next, session_id: '00000000-0000-0000-0000-000000000000' })
        .select('id')
        .single()
      if (data) setSwipeId(data.id)
    }
  }, [userId, restaurantId, liked, swipeId])

  const toggleVisited = useCallback(async () => {
    if (!userId) return
    const supabase = createClient()
    const next = !visited
    setVisited(next)

    if (next) {
      await supabase
        .from('user_visited_restaurants')
        .upsert({ user_id: userId, restaurant_id: restaurantId })
    } else {
      await supabase
        .from('user_visited_restaurants')
        .delete()
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
    }
  }, [userId, restaurantId, visited])

  return { liked, visited, toggleLike, toggleVisited }
}
