import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const org = await getAuthOrg();
    const { id } = await params;
    const { html, blocks } = await request.json();

    if (!id) return NextResponse.json({ error: "Parameter deficit" }, { status: 400 });

    // Enforce strict ownership before performing transactional atomic mutation.
    const updateCount = await prisma.template.updateMany({
      where: {
        id: id,
        orgId: org.id
      },
      data: {
        html: html,
        blocks: blocks // This stores the visual designer structural JSON
      }
    });

    if (updateCount.count === 0) {
      return NextResponse.json({ error: "Mutation blocked: Authority mismatch" }, { status: 403 });
    }

    return NextResponse.json({ success: true, message: "Persistent State Consolidated." });

  } catch (err) {
    console.error("PATCH mutation abort:", err);
    return NextResponse.json({ error: "Transaction fracture" }, { status: 500 });
  }
}
