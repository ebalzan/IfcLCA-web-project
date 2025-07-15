# Middleware Integration Guide

This guide explains how the main middleware (`src/middleware.ts`) and API middleware (`src/lib/api-middleware.ts`) work together to provide a unified authentication and database connection system.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Request Flow                              │
├─────────────────────────────────────────────────────────────┤
│ 1. Request comes in                                          │
│ 2. Main Middleware (src/middleware.ts)                      │
│    - Handles page routes (redirects, terms acceptance)      │
│    - For API routes: passes through to API middleware       │
│ 3. API Middleware (src/lib/api-middleware.ts)               │
│    - Handles authentication for API routes                  │
│    - Connects to database                                   │
│    - Calls your route handler                               │
└─────────────────────────────────────────────────────────────┘
```

## How They Work Together

### 1. Main Middleware (`src/middleware.ts`)
- **Purpose**: Handles page-level authentication and routing
- **Responsibilities**:
  - Redirects unauthenticated users to sign-in for page routes
  - Checks terms acceptance for page routes
  - Allows public routes to pass through
  - For API routes: passes control to API middleware

### 2. API Middleware (`src/lib/api-middleware.ts`)
- **Purpose**: Handles API-specific authentication and database connections
- **Responsibilities**:
  - Authenticates users for API routes
  - Connects to database
  - Provides user ID to route handlers
  - Handles API-specific error responses

## Route Protection Levels

### Public Routes (No Authentication)
```typescript
// These routes are accessible without authentication
const PUBLIC_ROUTES = [
  "/",
  "/sign-in", 
  "/sign-up",
  "/terms",
  "/privacy",
  "/cookies",
];
```

### Public API Routes (Database Only)
```typescript
// These API routes need database but no authentication
const PUBLIC_API_ROUTES = [
  "/api/accept-terms",
  "/api/kbob",
];
```

### Protected Routes (Authentication Required)
```typescript
// These routes require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/projects", 
  "/materials",
  "/settings",
  "/reports",
];
```

## Usage Examples

### 1. Protected API Route
```typescript
// src/app/api/projects/route.ts
import { withAuthAndDB, getUserId, AuthenticatedRequest } from "@/lib/api-middleware";

async function getProjects(request: AuthenticatedRequest) {
  const userId = getUserId(request); // User is guaranteed to be authenticated
  const projects = await Project.find({ userId });
  return NextResponse.json(projects);
}

export const GET = withAuthAndDB(getProjects);
```

### 2. Public API Route
```typescript
// src/app/api/kbob/route.ts
import { withDB } from "@/lib/api-middleware";

async function getKBOBMaterials() {
  const materials = await KBOBMaterial.findValidMaterials();
  return NextResponse.json(materials);
}

export const GET = withDB(getKBOBMaterials);
```

### 3. Protected Page Route
```typescript
// src/app/dashboard/page.tsx
// No special handling needed - main middleware handles authentication
export default function DashboardPage() {
  return <div>Dashboard content</div>;
}
```

## Request Flow Examples

### Example 1: Authenticated API Request
```
1. Request: GET /api/projects
2. Main Middleware: Checks if it's an API route → passes through
3. API Middleware: 
   - Authenticates user
   - Connects to database
   - Calls your handler with userId
4. Your Handler: Processes request with authenticated user
```

### Example 2: Unauthenticated API Request
```
1. Request: GET /api/projects (no auth token)
2. Main Middleware: Checks if it's an API route → passes through
3. API Middleware: 
   - Fails authentication
   - Returns 401 Unauthorized
4. Client receives 401 error
```

### Example 3: Protected Page Request (Unauthenticated)
```
1. Request: GET /dashboard (no auth token)
2. Main Middleware: 
   - Detects unauthenticated user
   - Redirects to /sign-in?redirect_url=/dashboard
3. User is redirected to sign-in page
```

### Example 4: Public API Request
```
1. Request: GET /api/kbob
2. Main Middleware: Checks if it's a public API route → allows
3. API Middleware: 
   - Skips authentication (public route)
   - Connects to database
   - Calls your handler
4. Your Handler: Processes request without user context
```

## Configuration

### Adding New Public Routes
To add a new public route, update the arrays in `src/lib/unified-middleware.ts`:

```typescript
const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up", 
  "/terms",
  "/privacy",
  "/cookies",
  "/new-public-route", // Add here
];

const PUBLIC_API_ROUTES = [
  "/api/accept-terms",
  "/api/kbob",
  "/api/new-public-api", // Add here
];
```

### Adding New Protected Routes
To add a new protected route, update the array in `src/lib/unified-middleware.ts`:

```typescript
const PROTECTED_ROUTES = [
  "/dashboard",
  "/projects",
  "/materials", 
  "/settings",
  "/reports",
  "/new-protected-route", // Add here
];
```

## Error Handling

### Main Middleware Errors
- **Unauthenticated page access**: Redirects to sign-in
- **Terms not accepted**: Redirects to terms page
- **Invalid routes**: 404 handling

### API Middleware Errors
- **Unauthenticated API access**: Returns 401 JSON response
- **Database connection errors**: Returns 500 JSON response
- **General errors**: Returns 500 JSON response

## Benefits of This Architecture

1. **Separation of Concerns**: Page routes and API routes handled differently
2. **Consistent Authentication**: All protected routes use the same auth logic
3. **Automatic Database Connections**: No manual `connectToDatabase()` calls needed
4. **Type Safety**: TypeScript support for authenticated requests
5. **Error Handling**: Centralized error handling for different scenarios
6. **Maintainability**: Changes to auth logic only need to be made in one place

## Migration Checklist

When migrating existing routes:

### For API Routes:
1. ✅ Import middleware functions from `@/lib/api-middleware`
2. ✅ Replace export function with handler function
3. ✅ Wrap handler with appropriate middleware (`withAuthAndDB`, `withDB`, etc.)
4. ✅ Remove manual `auth()` and `connectToDatabase()` calls
5. ✅ Use `getUserId(request)` to get user ID
6. ✅ Update function signature to use `AuthenticatedRequest`

### For Page Routes:
1. ✅ No changes needed - main middleware handles everything automatically
2. ✅ Ensure route is in the correct protection array if needed

## Testing

### Test Cases to Verify:
1. **Authenticated API requests** should work normally
2. **Unauthenticated API requests** should return 401
3. **Authenticated page requests** should work normally  
4. **Unauthenticated page requests** should redirect to sign-in
5. **Public routes** should work without authentication
6. **Terms acceptance** should be enforced for page routes
7. **Database connections** should work for all API routes 