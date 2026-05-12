import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const org = await getAuthOrg();
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing target ID" }, { status: 400 });

    // Lock query to target ID AND user-owned Org ID ensuring logical isolation
    const deleteResult = await prisma.template.deleteMany({
      where: { 
        id: id,
        orgId: org.id
      }
    });

    if (deleteResult.count === 0) {
      return NextResponse.json({ error: "Operation unauthorized or resource missing" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Secure relational cleanup complete" });
  } catch (e) {
    console.error("Delete failure:", e);
    return NextResponse.json({ error: "Erasure sequence aborted" }, { status: 500 });
  }
}
