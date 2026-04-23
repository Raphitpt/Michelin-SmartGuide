import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

const AUTH_PATHS = ['/login']
const PARCOURS_ROUTE = '/parcours-sensoriel'
// Ces routes font partie du flux d'inscription restaurant et doivent rester
// accessibles même quand l'utilisateur est connecté (chef en attente de vérification)
const CHEF_FLOW_PATHS = ['/login/restaurant/verify', '/login/restaurant/status']

function isAuthOnly(pathname: string) {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function isChefFlowPath(pathname: string) {
  return CHEF_FLOW_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Les pages du flux chef (verify/status) sont accessibles même connecté
  if (isChefFlowPath(pathname)) {
    return response
  }

  if (isAuthOnly(pathname) && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (user && !isAuthOnly(pathname) && pathname !== PARCOURS_ROUTE) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    )

    // Les chefs n'ont pas de taste profile — ne pas les rediriger vers le parcours
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'chef' || profile?.role === 'admin') {
      return response
    }

    const { data } = await supabase
      .from('user_taste_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!data) {
      return NextResponse.redirect(new URL(PARCOURS_ROUTE, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
