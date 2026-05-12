import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg, canUser, RoleDenialResponse } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await canUser('MUTATE_DATA'))) {
      return RoleDenialResponse();
    }
    const org = await getAuthOrg();
    const { id } = await params;

    // Ensure physical ownership before absolute purging
    await prisma.campaign.delete({
      where: {
        id: id,
        orgId: org.id
      }
    });

    return NextResponse.json({ success: true, message: "Physical removal committed." });
  } catch (err: any) {
    return NextResponse.json({ error: "Purge blocked. It might possess related event data." }, { status: 400 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const org = await getAuthOrg();
    const { id } = await params;

    const camp = await prisma.campaign.findUnique({
      where: { id, orgId: org.id },
      include: { template: true }
    });

    if (!camp) return NextResponse.json({ error: "Entity not found" }, { status: 404 });

    return NextResponse.json(camp);
  } catch (e) {
    return NextResponse.json({ error: "Fetch collapse" }, { status: 500 });
  }
}
