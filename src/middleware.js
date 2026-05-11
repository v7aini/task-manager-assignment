import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-me'
);

export async function middleware(request) {
  const token = request.cookies.get('token')?.value;

  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const protectedPaths = ['/dashboard', '/api/projects', '/api/tasks'];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  // Paths that are only for non-authenticated users
  const authPaths = ['/login', '/signup'];
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (isAuthPage && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // Invalid token, allow access to auth pages
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/login', '/signup'],
};
