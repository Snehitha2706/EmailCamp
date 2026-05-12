import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg } from '@/lib/auth';

export async function GET() {
  try {
    const org = await getAuthOrg();
    
    // 1. Count Physical Total Contacts
    const contactsCount = await prisma.contact.count({
      where: { orgId: org.id }
    });

    // 2. Count Active Successful Sends
    const totalSends = await prisma.campaignSend.count({
      where: { campaign: { orgId: org.id } }
    });

    // 3. Fetch all tracking events to compute averages
    const totalEvents = await prisma.emailEvent.groupBy({
      by: ['eventType'],
      where: { campaign: { orgId: org.id } },
      _count: true
    });

    const openEventCount = totalEvents.find(e => e.eventType === 'open')?._count || 0;
    const clickEventCount = totalEvents.find(e => e.eventType === 'click')?._count || 0;
    
    // Calculate rates securely avoiding Div by 0!
    const openRate = totalSends > 0 ? ((openEventCount / totalSends) * 100).toFixed(1) : '0.0';
    const clickRate = totalSends > 0 ? ((clickEventCount / totalSends) * 100).toFixed(1) : '0.0';

    // 4. Count actively executing streams
    const activeSends = await prisma.campaign.count({
      where: { orgId: org.id, status: { in: ['sending', 'scheduled'] } }
    });

    // 5. Fetch recent campaign streams for activity widget
    const recentCampaigns = await prisma.campaign.findMany({
      where: { orgId: org.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        name: true,
        status: true,
        _count: { select: { sends: true } }
      }
    });

    return NextResponse.json({
      contacts: contactsCount,
      sends: totalSends,
      activeSends: activeSends,
      openRate: `${openRate}%`,
      clickRate: `${clickRate}%`,
      recentStreams: recentCampaigns
    });

  } catch (err) {
    console.error("Dashboard telemetry aggregate failure:", err);
    return NextResponse.json({ error: "Sync deficit" }, { status: 500 });
  }
}
