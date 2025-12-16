import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'; // Fixed import
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  const { pathname } = request.nextUrl;

  // Define public routes (no authentication required)
  const isPublicRoute = pathname === '/';
  const isProtectedRoute = pathname.startsWith('/dashboard');

  // If user is not logged in and tries to access protected route
  if (!session && isProtectedRoute) {
    const loginUrl = new URL('/', request.url);
    // Optional: Add return URL for after login
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and tries to access public route (login)
  if (session && isPublicRoute) {
    const dashboardUrl = new URL('/dashboard/profile', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*']
};
