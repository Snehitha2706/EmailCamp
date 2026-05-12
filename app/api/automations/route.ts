import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg, canUser, RoleDenialResponse } from '@/lib/auth';

export async function GET() {
  try {
    const org = await getAuthOrg();
    const autos = await prisma.automation.findMany({
      where: { orgId: org.id },
      include: { template: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(autos);
  } catch (e) {
    return NextResponse.json({ error: "Automation query defect" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await canUser('MUTATE_DATA'))) return RoleDenialResponse();
    
    const org = await getAuthOrg();
    const { name, triggerType, triggerListId, actionTemplateId } = await request.json();

    if (!name || !triggerType || !actionTemplateId) {
      return NextResponse.json({ error: "Definition schema fragmented." }, { status: 400 });
    }

    const automation = await prisma.automation.create({
      data: {
        orgId: org.id,
        name,
        triggerType,
        triggerListId: triggerListId || null,
        actionTemplateId,
        status: 'active',
        totalRuns: 0
      }
    });

    return NextResponse.json(automation);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Construct assembly failed." }, { status: 500 });
  }
}
