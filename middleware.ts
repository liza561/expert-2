import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
   const { sessionClaims } = await auth();   
   const { protect } = auth;              

  // Protect dashboard routes (all signed-in users)
  if (isDashboardRoute(req)) {
    await protect();
  }

  // Protect admin routes (admin only)
  if (isAdminRoute(req)) {
    await protect();

    const role = sessionClaims?.user?.publicMetadata?.role;

    if (role !== "admin") {
      return Response.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',

    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
