import { NextResponse } from 'next/server';
import { getAuthOrg, canUser, RoleDenialResponse } from '@/lib/auth';
import { executeCampaignDispatch } from '@/lib/dispatchService';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🛡️ LOCKDOWN: Stop Read-Only Viewers
    if (!(await canUser('MUTATE_DATA'))) {
      return RoleDenialResponse();
    }

    await getAuthOrg(); // Validates session
    const { id } = await params;

    // 🚀 INVOKE CENTRAL ENGINE
    const result = await executeCampaignDispatch(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: "Transmission Complete",
      summary: result.summary
    });

  } catch (err: any) {
    console.error("Manual Trigger Fault:", err);
    return NextResponse.json({ error: err.message || "Unknown Vector Breach" }, { status: 500 });
  }
}
