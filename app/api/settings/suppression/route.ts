import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg, canUser, RoleDenialResponse } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const org = await getAuthOrg();
    
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get('query') || '';

    const entries = await prisma.suppressionEntry.findMany({
      where: {
        orgId: org.id,
        ...(query ? { email: { contains: query, mode: 'insensitive' } } : {})
      },
      orderBy: { suppressedAt: 'desc' }
    });
    
    return NextResponse.json(entries);
  } catch (err) {
    return NextResponse.json({ error: "Telemetry deficiency in suppression table." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await canUser('MUTATE_DATA'))) return RoleDenialResponse();

    const org = await getAuthOrg();
    const { email, reason } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Identity definition required." }, { status: 400 });
    }

    const entry = await prisma.suppressionEntry.upsert({
      where: {
        orgId_email: {
          orgId: org.id,
          email: email.toLowerCase().trim()
        }
      },
      update: {
        reason: reason || 'manual',
        suppressedAt: new Date()
      },
      create: {
        orgId: org.id,
        email: email.toLowerCase().trim(),
        reason: reason || 'manual',
        suppressedAt: new Date()
      }
    });

    return NextResponse.json(entry);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Insertion rupture." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await canUser('MUTATE_DATA'))) return RoleDenialResponse();
    
    const org = await getAuthOrg();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Reference key absent." }, { status: 400 });

    await prisma.suppressionEntry.delete({
      where: {
        id,
        orgId: org.id // hard lock to scoped org
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Erasure vetoed." }, { status: 500 });
  }
}
