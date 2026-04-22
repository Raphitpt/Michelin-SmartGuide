import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

const AUTH_PATHS = ['/login']
const PARCOURS_ROUTE = '/parcours-sensoriel'

function isAuthOnly(pathname: string) {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

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
