# Middleware Architecture

This document explains the separated middleware architecture with clear separation of concerns.

## File Structure

```
src/lib/
├── auth-middleware.ts      # Authentication logic only
├── api-middleware.ts       # API-specific logic (uses auth middleware)
├── page-middleware.ts      # Page-level routing logic
├── route-config.ts         # Route configuration
└── middleware-architecture.md  # This file
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Request Flow                              │
├─────────────────────────────────────────────────────────────┤
│ 1. Request comes in                                          │
│ 2. Page Middleware (src/middleware.ts)                      │
│    - Handles page routes (redirects, terms acceptance)      │
│    - For API routes: passes through to API middleware       │
│ 3. API Middleware (src/lib/api-middleware.ts)               │
│    - Uses Auth Middleware for authentication                │
│    - Connects to database                                   │
│    - Calls your route handler                               │
└─────────────────────────────────────────────────────────────┘
```

## 1. Auth Middleware (`src/lib/auth-middleware.ts`)

**Purpose**: Handles authentication only

**Responsibilities**:
- Authenticates users using Clerk
- Provides user ID to handlers
- Returns 401 for unauthenticated requests

**Exports**:
- `withAuth()` - For routes without parameters
- `withAuthParams()` - For routes with parameters
- `getUserId()` - Helper to get user ID
- `AuthenticatedRequest` - Type for authenticated requests

**Usage**:
```typescript
import { withAuth, getUserId, AuthenticatedRequest } from "@/lib/auth-middleware";

async function myHandler(request: AuthenticatedRequest) {
  const userId = getUserId(request);
  // Your logic here
}

export const GET = withAuth(myHandler);
```

## 2. API Middleware (`src/lib/api-middleware.ts`)

**Purpose**: Handles API-specific logic and uses auth middleware

**Responsibilities**:
- Uses auth middleware for authentication
- Connects to database
- Handles API-specific error responses

**Exports**:
- `withAuthAndDB()` - Auth + Database for routes without parameters
- `withAuthAndDBParams()` - Auth + Database for routes with parameters
- `withDB()` - Database only for public routes
- `withDBParams()` - Database only for public routes with parameters
- `handleApiError()` - Helper for API error handling

**Usage**:
```typescript
import { withAuthAndDB } from "@/lib/api-middleware";
import { getUserId, AuthenticatedRequest } from "@/lib/auth-middleware";

async function myApiHandler(request: AuthenticatedRequest) {
  const userId = getUserId(request);
  // Your API logic here
}

export const GET = withAuthAndDB(myApiHandler);
```

## 3. Page Middleware (`src/lib/page-middleware.ts`)

**Purpose**: Handles page-level authentication and routing

**Responsibilities**:
- Redirects unauthenticated users to sign-in for page routes
- Checks terms acceptance for page routes
- Allows public routes to pass through
- For API routes: passes control to API middleware

**Usage**: Used automatically by `src/middleware.ts`

## 4. Route Configuration (`src/lib/route-config.ts`)

**Purpose**: Centralized route configuration

**Responsibilities**:
- Defines public routes
- Defines protected routes
- Defines public API routes
- Provides helper functions to check route types

**Configuration**:
```typescript
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
```

## Usage Examples

### Protected API Route
```typescript
// src/app/api/projects/route.ts
import { withAuthAndDB } from "@/lib/api-middleware";
import { getUserId, AuthenticatedRequest } from "@/lib/auth-middleware";

async function getProjects(request: AuthenticatedRequest) {
  const userId = getUserId(request);
  const projects = await Project.find({ userId });
  return NextResponse.json(projects);
}

export const GET = withAuthAndDB(getProjects);
```

### Public API Route
```typescript
// src/app/api/kbob/route.ts
import { withDB } from "@/lib/api-middleware";

async function getKBOBMaterials() {
  const materials = await KBOBMaterial.findValidMaterials();
  return NextResponse.json(materials);
}

export const GET = withDB(getKBOBMaterials);
```

### Protected Page Route
```typescript
// src/app/dashboard/page.tsx
// No special handling needed - page middleware handles everything
export default function DashboardPage() {
  return <div>Dashboard content</div>;
}
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each middleware has a single responsibility
2. **Reusability**: Auth middleware can be used independently
3. **Maintainability**: Changes to auth logic only affect auth middleware
4. **Testability**: Each middleware can be tested independently
5. **Flexibility**: Can use auth middleware without database connection
6. **Type Safety**: Proper TypeScript support throughout

## Migration Guide

### From Old Pattern to New Pattern

**Before**:
```typescript
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  // Your logic here
}
```

**After**:
```typescript
import { withAuthAndDB } from "@/lib/api-middleware";
import { getUserId, AuthenticatedRequest } from "@/lib/auth-middleware";

async function getData(request: AuthenticatedRequest) {
  const userId = getUserId(request);
  // Your logic here
}

export const GET = withAuthAndDB(getData);
```

## Adding New Routes

### Adding a New Public Route
1. Add to `PUBLIC_ROUTES` in `src/lib/route-config.ts`
2. No middleware needed

### Adding a New Protected Page Route
1. Add to `PROTECTED_ROUTES` in `src/lib/route-config.ts`
2. No middleware needed in the page file

### Adding a New Protected API Route
1. Use `withAuthAndDB()` or `withAuthAndDBParams()`
2. Import `getUserId` and `AuthenticatedRequest` from auth middleware

### Adding a New Public API Route
1. Add to `PUBLIC_API_ROUTES` in `src/lib/route-config.ts`
2. Use `withDB()` or `withDBParams()`

## Error Handling

- **Auth Middleware**: Returns 401 for authentication failures
- **API Middleware**: Returns 500 for database/API errors
- **Page Middleware**: Redirects to sign-in for unauthenticated users

## Testing

Each middleware can be tested independently:

```typescript
// Test auth middleware
import { withAuth } from "@/lib/auth-middleware";

// Test API middleware
import { withAuthAndDB } from "@/lib/api-middleware";

// Test route configuration
import { isPublicRoute } from "@/lib/route-config";
``` 