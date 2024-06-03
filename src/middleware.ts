import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from './authMiddleware';
import { intlMiddleware } from './intlMiddleware';

export default async function middleware(req: NextRequest) {
  // First, run the internationalization middleware
  const intlResponse = await intlMiddleware(req);
  if (intlResponse) {
    return intlResponse;
  }

  // Then, run the authentication middleware
  return authMiddleware(req);
}

export const config = {
  matcher: [
    '/', 
    '/(zh|ru|en)/:path*', 
    '/dashboard'
  ]
};