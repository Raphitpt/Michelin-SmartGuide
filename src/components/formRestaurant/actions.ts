'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getRecoDimensions() {
  const { data, error } = await supabase
    .from('reco_dimensions')
    .select('id, max_tags, question, nom')

  if (error) throw new Error(error.message)

  return data ?? []
}