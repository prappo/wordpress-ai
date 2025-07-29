import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { CookieOptions, createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Check if the request is for protected routes
  if (request.nextUrl.pathname.startsWith('/app') || 
      request.nextUrl.pathname.startsWith('/share') ||
      request.nextUrl.pathname.startsWith('/dashboard')) {
    
    console.log('Processing protected route:', request.nextUrl.pathname);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set(name, value, options);
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set(name, '', { ...options, maxAge: 0 });
          },
        },
      },
    );

    // Check if user is authenticated
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    console.log('Auth check:', { user: user?.email, error });

    // If there's no authenticated user, redirect to login
    if (!user || error) {
      console.log('No authenticated user, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // User is authenticated, allow access
    console.log('User authenticated, allowing access');
    return NextResponse.next();
  }

  return response;
}

export const config = {
  matcher: [
    '/app/:path*',
    '/share/:path*',
    '/dashboard/:path*',
    '/api/:path*',
    '/auth/:path*',
    '/login',
    '/signup',
  ],
};
