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

    const openEventCount = totalEvents.find(e => e.eventType === 'opened' || e.eventType === 'open')?._count || 0;
    const clickEventCount = totalEvents.find(e => e.eventType === 'clicked' || e.eventType === 'click')?._count || 0;
    const bounceEventCount = totalEvents.find(e => e.eventType === 'bounced' || e.eventType === 'bounce')?._count || 0;
    const complaintEventCount = totalEvents.find(e => e.eventType === 'complained' || e.eventType === 'complaint')?._count || 0;
    
    // Calculate rates securely avoiding Div by 0!
    const openRate = totalSends > 0 ? ((openEventCount / totalSends) * 100).toFixed(1) : '0.0';
    const clickRate = totalSends > 0 ? ((clickEventCount / totalSends) * 100).toFixed(1) : '0.0';
    const bounceRate = totalSends > 0 ? ((bounceEventCount / totalSends) * 100).toFixed(1) : '0.0';
    const complaintRate = totalSends > 0 ? ((complaintEventCount / totalSends) * 100).toFixed(2) : '0.00';

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

    // 6. Fetch all sent campaigns with event aggregations for top 5 ranking
    const allSentCampaigns = await prisma.campaign.findMany({
      where: { orgId: org.id, status: 'sent' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            sends: true,
            events: true // placeholder, we detail next
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Detailed event count by campaign
    const eventStats = await prisma.emailEvent.groupBy({
      by: ['campaignId', 'eventType'],
      where: { campaignId: { in: allSentCampaigns.map(c => c.id) } },
      _count: true
    });

    // Calculate performance per campaign and sort in JS
    const topCampaigns = allSentCampaigns.map(camp => {
      const campSends = camp._count.sends || 0;
      const campOpens = eventStats
        .filter(e => e.campaignId === camp.id && (e.eventType === 'opened' || e.eventType === 'open'))
        .reduce((acc, e) => acc + e._count, 0);
      const campClicks = eventStats
        .filter(e => e.campaignId === camp.id && (e.eventType === 'clicked' || e.eventType === 'click'))
        .reduce((acc, e) => acc + e._count, 0);
      
      const cOpenRate = campSends > 0 ? (campOpens / campSends) * 100 : 0;
      const cClickRate = campSends > 0 ? (campClicks / campSends) * 100 : 0;

      return {
        id: camp.id,
        name: camp.name,
        sends: campSends,
        openRate: cOpenRate.toFixed(1) + '%',
        clickRate: cClickRate.toFixed(1) + '%',
        rawOpenRate: cOpenRate,
        createdAt: camp.createdAt
      };
    })
    .sort((a, b) => b.rawOpenRate - a.rawOpenRate)
    .slice(0, 5);

    return NextResponse.json({
      contacts: contactsCount,
      sends: totalSends,
      activeSends: activeSends,
      openRate: `${openRate}%`,
      clickRate: `${clickRate}%`,
      bounceRate: `${bounceRate}%`,
      complaintRate: `${complaintRate}%`,
      recentStreams: recentCampaigns,
      topCampaigns: topCampaigns
    });

  } catch (err) {
    console.error("Dashboard telemetry aggregate failure:", err);
    return NextResponse.json({ error: "Sync deficit" }, { status: 500 });
  }
}
