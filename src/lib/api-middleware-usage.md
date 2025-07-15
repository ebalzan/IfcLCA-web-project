# API Middleware Usage Guide

This guide explains how to use the new API middleware pattern that handles authentication and database connections automatically.

## Overview

The new middleware pattern eliminates the need to manually call `connectToDatabase()` and `auth()` in every API route. Instead, you wrap your route handlers with middleware functions that handle these concerns automatically.

## Available Middleware Functions

### `withAuthAndDB(handler)`
Use this for API routes that don't have dynamic parameters.

### `withAuthAndDBParams(handler)`
Use this for API routes that have dynamic parameters (like `[id]` routes).

## Basic Usage

### Simple API Route (No Parameters)

```typescript
// Before (old pattern)
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Your logic here
    const data = await SomeModel.find({ userId });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// After (new pattern)
import { withAuthAndDB, getUserId, AuthenticatedRequest } from "@/lib/api-middleware";

async function getData(request: AuthenticatedRequest) {
  const userId = getUserId(request);
  
  // Your logic here
  const data = await SomeModel.find({ userId });
  return NextResponse.json(data);
}

export const GET = withAuthAndDB(getData);
```

### API Route with Parameters

```typescript
// Before (old pattern)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const { id } = params;
    // Your logic here
    const data = await SomeModel.findById(id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// After (new pattern)
import { withAuthAndDBParams, getUserId, AuthenticatedRequest } from "@/lib/api-middleware";

async function getData(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ [key: string]: string }> }
) {
  const userId = getUserId(request);
  const { id } = await params;
  
  // Your logic here
  const data = await SomeModel.findById(id);
  return NextResponse.json(data);
}

export const GET = withAuthAndDBParams(getData);
```

## Helper Functions

### `getUserId(request)`
Get the authenticated user ID from the request object.

```typescript
const userId = getUserId(request);
```

### `handleApiError(error, context?)`
Handle common API errors with proper status codes.

```typescript
try {
  // Your logic
} catch (error) {
  return handleApiError(error, "getData");
}
```

## Multiple HTTP Methods

You can export multiple HTTP methods from the same file:

```typescript
import { withAuthAndDB, withAuthAndDBParams, getUserId, AuthenticatedRequest } from "@/lib/api-middleware";

// GET handler
async function getData(request: AuthenticatedRequest) {
  const userId = getUserId(request);
  const data = await SomeModel.find({ userId });
  return NextResponse.json(data);
}

// POST handler
async function createData(request: AuthenticatedRequest) {
  const userId = getUserId(request);
  const body = await request.json();
  const data = await SomeModel.create({ ...body, userId });
  return NextResponse.json(data);
}

// PUT handler with parameters
async function updateData(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ [key: string]: string }> }
) {
  const userId = getUserId(request);
  const { id } = await params;
  const body = await request.json();
  const data = await SomeModel.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(data);
}

export const GET = withAuthAndDB(getData);
export const POST = withAuthAndDB(createData);
export const PUT = withAuthAndDBParams(updateData);
```

## Error Handling

The middleware automatically handles:
- Authentication errors (401)
- Database connection errors (500)
- General errors (500)

For custom error handling, you can still use try-catch blocks in your handlers:

```typescript
async function getData(request: AuthenticatedRequest) {
  try {
    const userId = getUserId(request);
    const data = await SomeModel.find({ userId });
    
    if (!data) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, "getData");
  }
}
```

## Benefits

1. **DRY Principle**: No more repeating auth and database connection code
2. **Consistency**: All API routes handle authentication and database connections the same way
3. **Maintainability**: Changes to auth or database logic only need to be made in one place
4. **Type Safety**: Better TypeScript support with `AuthenticatedRequest`
5. **Error Handling**: Centralized error handling for common scenarios

## Migration Checklist

When migrating existing routes:

1. ✅ Import the middleware functions
2. ✅ Remove manual `auth()` calls
3. ✅ Remove manual `connectToDatabase()` calls
4. ✅ Change function signature to use `AuthenticatedRequest`
5. ✅ Use `getUserId(request)` instead of destructuring from `auth()`
6. ✅ For parameter routes, change `params` to `Promise<{ [key: string]: string }>`
7. ✅ Export the wrapped function instead of the original
8. ✅ Remove try-catch blocks that only handle auth/database errors 