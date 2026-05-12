import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg, canUser, RoleDenialResponse } from '@/lib/auth';

// Retrieve current operational parameters
export async function GET() {
  try {
    const org = await getAuthOrg();
    // We re-fetch explicitly to guarantee absolute fresh schema data.
    const data = await prisma.organisation.findUnique({
      where: { id: org.id },
      select: {
        name: true,
        fromEmail: true,
        fromName: true,
        awsRegion: true,
        sesAccessKey: true,
        sesSecretKey: true
      }
    });
    return NextResponse.json(data);
  } catch (err) {
    console.error("CRITICAL SETTINGS ERROR:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Commit configuration mutations securely
export async function PATCH(request: Request) {
  try {
    const org = await getAuthOrg();
    const body = await request.json();

    // 🛡️ HARDLOCK: Only Super Admins can mutate credentials
    if (!(await canUser('EDIT_SETTINGS'))) {
      return RoleDenialResponse();
    }

    const updated = await prisma.organisation.update({
      where: { id: org.id },
      data: {
        name: body.name || undefined,
        fromEmail: body.fromEmail || undefined,
        fromName: body.fromName || undefined,
        awsRegion: body.awsRegion || undefined,
        sesAccessKey: body.sesAccessKey || undefined,
        sesSecretKey: body.sesSecretKey || undefined,
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("CRITICAL UPDATE ERROR:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
