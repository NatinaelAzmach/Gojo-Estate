import { type NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getUserRole(userId: string): Promise<string | null> {
  const { data } = await getAdminClient()
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  return data?.role ?? null;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient(request, response);

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isHomePage = pathname === '/';
  const isProfileRoute = pathname === '/profile' || pathname.startsWith('/profile/');
  const isAgentRoute = pathname === '/agent' || pathname.startsWith('/agent/');
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isPostPropertyRoute = pathname === '/post-property' || pathname.startsWith('/post-property/');
  const isMyPropertiesRoute = pathname === '/my-properties' || pathname.startsWith('/my-properties/');

  // If authenticated user visits home or auth pages, redirect to their dashboard
  if (user && (isHomePage || isAuthPage)) {
    const role = await getUserRole(user.id);
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    return NextResponse.redirect(new URL('/listings', request.url));
  }

  // Unauthenticated users can't access protected routes
  if (!user && (isProfileRoute || isAgentRoute || isAdminRoute || isPostPropertyRoute || isMyPropertiesRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && isAgentRoute) {
    const role = await getUserRole(user.id);
    if (role !== 'agent' && role !== 'admin') {
      // Wrong role — send to their dashboard
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  if (user && isAdminRoute) {
    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/listings', request.url));
    }
  }

  if (user && isProfileRoute) {
    // Admin visiting /profile — send to admin dashboard
    const role = await getUserRole(user.id);
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/profile',
    '/profile/:path*',
    '/agent',
    '/agent/:path*',
    '/admin',
    '/admin/:path*',
    '/post-property',
    '/post-property/:path*',
    '/my-properties',
    '/my-properties/:path*',
  ],
};
