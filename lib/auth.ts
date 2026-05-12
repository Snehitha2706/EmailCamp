import { auth } from "@clerk/nextjs/server";
import prisma from "./db";
import { NextResponse } from 'next/server';

export async function getAuthOrg() {
  const session = await auth();
  const { userId, orgId } = session;
  
  if (!userId) {
    throw new Error("Authorization required for data fetch.");
  }

  // Pivot dynamically between Clerk Organization and fallback User Personal Workspace
  const activeContextId = orgId || userId;

  let org = await prisma.organisation.findUnique({
    where: { id: activeContextId }
  });

  if (!org) {
    org = await prisma.organisation.create({
      data: {
        id: activeContextId,
        name: orgId ? "Collaborative Workspace" : "Personal Workspace",
      }
    });
  }

  return org;
}

// 🛡️ RBAC ENFORCEMENT ENGINE
export async function canUser(action: 'EDIT_SETTINGS' | 'MUTATE_DATA'): Promise<boolean> {
  const session = await auth();
  const { orgId, orgRole } = session;

  // If they are in a Personal Workspace (!orgId), they are implicitly the ultimate Super Admin
  if (!orgId) return true;

  const role = orgRole as string;

  // SUPER ADMIN -> Unlimited permission grid
  if (role === 'org:admin') return true;

  // CAMPAIGN MANAGER -> Can mutate lists, templates, campaigns. Cannot edit root platform settings.
  if (role === 'org:member') {
    if (action === 'EDIT_SETTINGS') return false;
    return true;
  }

  // VIEWER -> Read-only denial strategy.
  if (role === 'org:viewer') {
    return false; // Viewers cannot mutate any data at all
  }

  return false; // Implicit deny fail-safe
}

// Higher-order response generator for API routes
export function RoleDenialResponse() {
  return NextResponse.json({ 
    error: "Permission Denied: Access Level Deficit." 
  }, { status: 403 });
}
