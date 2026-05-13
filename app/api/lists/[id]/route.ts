import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg, canUser, RoleDenialResponse } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🛡️ Access Control
    if (!(await canUser('MUTATE_DATA'))) {
      return RoleDenialResponse();
    }

    const org = await getAuthOrg();
    const { id } = await params;

    // Perform cascading cleanup on dependencies (if needed, Prisma onDelete: Cascade handles ContactListMember)
    const deleted = await prisma.contactList.delete({
      where: { 
        id,
        orgId: org.id // Ensures strict multi-tenant security boundary
      }
    });

    return NextResponse.json({ success: true, deletedId: deleted.id });

  } catch (err) {
    console.error("Failure deleting list container:", err);
    return NextResponse.json({ error: "Failed to destroy specified identity group" }, { status: 500 });
  }
}
