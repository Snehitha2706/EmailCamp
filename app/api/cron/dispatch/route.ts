import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { executeCampaignDispatch } from '@/lib/dispatchService';

export const dynamic = 'force-dynamic'; // Crucial for cron to run dynamic every time

export async function GET(request: Request) {
  try {
    // 1. Highly secure handshake secret to prevent abuse
    // In real deployment, set CRON_SECRET env var and check header!
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized Cron Trigger" }, { status: 401 });
    }

    const now = new Date();

    // 2. Detect all overdue/due Scheduled Broadcasts
    const dueCampaigns = await prisma.campaign.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: now
        }
      },
      select: { id: true, name: true }
    });

    console.log(`⏰ CRON WAKE: Found ${dueCampaigns.length} campaigns ready for ignition.`);

    if (dueCampaigns.length === 0) {
      return NextResponse.json({ status: "idle", message: "No queues matured." });
    }

    // 3. Execute loop execution sequentially to avoid concurrency locks on DB
    const results = [];
    for (const camp of dueCampaigns) {
      console.log(`🔥 CRON IGNITING: ${camp.name} (${camp.id})`);
      try {
        const res = await executeCampaignDispatch(camp.id);
        results.push({ id: camp.id, success: res.success, details: res.summary });
      } catch (innerErr: any) {
        console.error(`❌ CRON FAULT for ${camp.id}:`, innerErr.message);
        results.push({ id: camp.id, success: false, error: innerErr.message });
      }
    }

    return NextResponse.json({
      status: "completed",
      timestamp: now.toISOString(),
      processed: results
    });

  } catch (err: any) {
    console.error("CRON CRITICAL COLLAPSE:", err);
    return NextResponse.json({ error: "Runner Fault" }, { status: 500 });
  }
}
