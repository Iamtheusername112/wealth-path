import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/investments(.*)',
  '/settings(.*)',
  '/notifications(.*)',
  '/kyc(.*)',
  '/cards(.*)',
])

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
])

const isAdminLoginRoute = createRouteMatcher([
  '/admin-login',
])

const isAccountDeactivatedRoute = createRouteMatcher([
  '/account-deactivated',
])

export default clerkMiddleware(async (auth, req) => {
  // Allow admin-login page without checks
  if (isAdminLoginRoute(req)) {
    return NextResponse.next()
  }

  // Handle admin routes separately
  if (isAdminRoute(req)) {
    // Check for admin cookie
    const adminToken = req.cookies.get('admin_token')
    if (!adminToken || adminToken.value !== 'admin_authenticated') {
      return NextResponse.redirect(new URL('/admin-login', req.url))
    }
    return NextResponse.next()
  }

  // Regular protected routes use Clerk
  if (isProtectedRoute(req)) {
    await auth.protect()
    
    // Don't check status on account-deactivated page to prevent redirect loop
    if (!req.nextUrl.pathname.startsWith('/account-deactivated')) {
      // Check if user account is deactivated
      const userId = auth().userId
      if (userId) {
        try {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
          )
          
          const { data: user, error } = await supabase
            .from('users')
            .select('status')
            .eq('id', userId)
            .single()
          
          console.log('Middleware: Checking user status for', userId, '- Status:', user?.status, 'Error:', error)
          
          if (user?.status === 'deactivated') {
            console.log('Middleware: Redirecting deactivated user to /account-deactivated')
            return NextResponse.redirect(new URL('/account-deactivated', req.url))
          }
        } catch (error) {
          console.error('Error checking user status in middleware:', error)
          // Continue if there's an error checking status
        }
      }
    }
  }
}, {
  debug: false,
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

