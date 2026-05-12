import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const org = await getAuthOrg();
    const { id } = await params;

    // 1. Get Absolute Campaign Master Record
    const campaign = await prisma.campaign.findUnique({
      where: { id, orgId: org.id },
      include: { template: { select: { name: true } } }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Trace missing" }, { status: 404 });
    }

    // 2. Aggregate Core Performance Counts
    const totalSends = await prisma.campaignSend.count({
      where: { campaignId: id }
    });

    const events = await prisma.emailEvent.groupBy({
      by: ['eventType'],
      where: { campaignId: id },
      _count: true
    });

    const opens = events.find(e => e.eventType === 'open')?._count || 0;
    const unsubs = events.find(e => e.eventType === 'unsubscribe')?._count || 0;

    // 3. Fetch recent raw stream events (Last 20)
    const recentActivity = await prisma.emailEvent.findMany({
      where: { campaignId: id },
      orderBy: { occurredAt: 'desc' },
      take: 20,
      include: { contact: { select: { email: true } } }
    });

    return NextResponse.json({
      campaign,
      stats: {
        sends: totalSends,
        opens,
        unsubscribes: unsubs,
        openRate: totalSends > 0 ? ((opens / totalSends) * 100).toFixed(1) + "%" : "0.0%"
      },
      stream: recentActivity
    });

  } catch (err) {
    return NextResponse.json({ error: "Aggregator Collapsed" }, { status: 500 });
  }
}
