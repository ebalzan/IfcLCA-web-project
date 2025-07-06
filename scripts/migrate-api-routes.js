#!/usr/bin/env node

/**
 * Script to help migrate API routes to use the new middleware pattern
 * 
 * Usage: node scripts/migrate-api-routes.js
 */

const fs = require('fs');
const path = require('path');

// API routes that need migration
const apiRoutes = [
  'src/app/api/activities/route.ts',
  'src/app/api/emissions/route.ts',
  'src/app/api/materials/check-matches/route.ts',
  'src/app/api/materials/element-counts/route.ts',
  'src/app/api/materials/match/preview/route.ts',
  'src/app/api/materials/match/route.ts',
  'src/app/api/materials/projects/route.ts',
  'src/app/api/materials/route.ts',
  'src/app/api/materials/[id]/match/route.ts',
  'src/app/api/materials/[id]/route.ts',
  'src/app/api/projects/[id]/elements/route.ts',
  'src/app/api/projects/[id]/emissions/totals/route.ts',
  'src/app/api/projects/[id]/route.ts',
  'src/app/api/projects/[id]/upload/elements/route.ts',
  'src/app/api/projects/[id]/upload/process/route.ts',
  'src/app/api/projects/[id]/upload/route.ts',
  'src/app/api/projects/route.ts',
  'src/app/api/projects/search/route.ts',
  'src/app/api/uploads/[id]/route.ts',
];

// Routes that don't need authentication (public)
const publicRoutes = [
  'src/app/api/accept-terms/route.ts',
  'src/app/api/kbob/route.ts',
];

console.log('🔍 API Route Migration Helper');
console.log('=============================\n');

console.log('📋 Routes that need migration to middleware pattern:');
apiRoutes.forEach((route, index) => {
  console.log(`${index + 1}. ${route}`);
});

console.log('\n📋 Public routes (no migration needed):');
publicRoutes.forEach((route, index) => {
  console.log(`${index + 1}. ${route}`);
});

console.log('\n📝 Migration Steps:');
console.log('1. For each route, replace the export function with a handler function');
console.log('2. Wrap the handler with withAuthAndDB() or withAuthAndDBParams()');
console.log('3. Remove manual auth() and connectToDatabase() calls');
console.log('4. Use getUserId(request) to get the user ID');
console.log('5. For parameter routes, change params to Promise<{ [key: string]: string }>');

console.log('\n🔧 Example migration:');
console.log(`
// Before:
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  // ... rest of logic
}

// After:
import { withAuthAndDB, getUserId, AuthenticatedRequest } from "@/lib/api-middleware";

async function getData(request: AuthenticatedRequest) {
  const userId = getUserId(request);
  // ... rest of logic
}

export const GET = withAuthAndDB(getData);
`);

console.log('\n✅ Benefits of migration:');
console.log('- DRY principle: No more repeating auth/database code');
console.log('- Consistency: All routes handle auth the same way');
console.log('- Maintainability: Changes only need to be made in one place');
console.log('- Type safety: Better TypeScript support');
console.log('- Error handling: Centralized error handling');

console.log('\n🚀 Ready to migrate! Start with the simpler routes first.'); 