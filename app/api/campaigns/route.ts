import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg, canUser, RoleDenialResponse } from '@/lib/auth';

// Fetch current active campaigns for the dashboard
export async function GET() {
  try {
    const org = await getAuthOrg();
    const campaigns = await prisma.campaign.findMany({
      where: { orgId: org.id },
      include: {
        template: { select: { name: true } },
        _count: { select: { sends: true, events: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(campaigns);
  } catch (err) {
    return NextResponse.json({ error: "Broadcast query failure" }, { status: 500 });
  }
}

// Register a new Campaign structure via stepper input
export async function POST(request: Request) {
  try {
    // 🛡️ ONLY Admins / Managers can build campaigns
    if (!(await canUser('MUTATE_DATA'))) {
      return RoleDenialResponse();
    }

    const org = await getAuthOrg();
    const body = await request.json();

    const scheduledDate = (body.scheduledAt && body.scheduledAt.trim() !== '' && !isNaN(Date.parse(body.scheduledAt))) 
      ? new Date(body.scheduledAt) 
      : null;

    const campaign = await prisma.campaign.create({
      data: {
        orgId: org.id,
        name: body.name || "Untitled Campaign",
        subject: body.subject || "",
        previewText: body.previewText || "",
        fromName: body.fromName || "",
        fromEmail: body.fromEmail || "",
        templateId: body.templateId || null,
        targetAll: body.targetAll === true,
        targetListId: body.targetListId || null,
        scheduledAt: scheduledDate,
        status: "draft"
      }
    });

    return NextResponse.json(campaign);
  } catch (err) {
    console.error("POST Campaign Error:", err);
    return NextResponse.json({ error: "Physical Campaign Creation Aborted" }, { status: 500 });
  }
}
