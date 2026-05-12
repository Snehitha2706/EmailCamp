import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg, canUser, RoleDenialResponse } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await canUser('MUTATE_DATA'))) {
      return RoleDenialResponse();
    }
    
    const org = await getAuthOrg();
    const { id } = await params;

    // 1. Locate source entity
    const source = await prisma.campaign.findUnique({
      where: { id, orgId: org.id }
    });

    if (!source) {
      return NextResponse.json({ error: "Source void" }, { status: 404 });
    }

    // 2. Replicate structural template into fresh draft
    const copy = await prisma.campaign.create({
      data: {
        orgId: org.id,
        name: `${source.name} (Copy)`,
        subject: source.subject,
        previewText: source.previewText,
        fromName: source.fromName,
        fromEmail: source.fromEmail,
        templateId: source.templateId,
        targetListId: source.targetListId,
        targetAll: source.targetAll,
        status: 'draft' // Enforce safe draft state
      }
    });

    return NextResponse.json(copy);

  } catch (err) {
    return NextResponse.json({ error: "Replication collapse" }, { status: 500 });
  }
}
