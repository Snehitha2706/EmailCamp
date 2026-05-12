import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/unsubscribe(.*)',
  '/api/unsubscribe(.*)',
  '/api/track(.*)',
  '/api/webhooks/ses(.*)',
  '/api/cron(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) {
    return; // Bypass entirely for public endpoints
  }

  // 1. Guarantee basic identity authentication
  const { userId, orgId } = await auth();

  if (!userId) {
    // Not logged in -> Protected route handler will handle redirect internally or manually throw
    await auth.protect();
    return;
  }

  // 2. Force Organization Context Enforcement
  // If they have no active Org, and aren't already on the selection page, drive them there physically.
  if (!orgId && !request.nextUrl.pathname.startsWith('/select-org')) {
    const orgSelectionUrl = new URL('/select-org', request.url);
    return NextResponse.redirect(orgSelectionUrl);
  }
  
  return;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
