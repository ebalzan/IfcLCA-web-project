// Configuration for route protection
export const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/terms",
  "/privacy",
  "/cookies",
];

export const PUBLIC_API_ROUTES = [
  "/api/accept-terms",
  "/api/kbob",
];

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/projects",
  "/materials",
  "/settings",
  "/reports",
];

/**
 * Check if a route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if an API route is public
 */
export function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if a route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if it's an API route
 */
export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
} 