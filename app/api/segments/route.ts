import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg, canUser, RoleDenialResponse } from '@/lib/auth';

export async function GET() {
  try {
    const org = await getAuthOrg();
    const segments = await prisma.segment.findMany({
      where: { orgId: org.id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(segments);
  } catch (err) {
    return NextResponse.json({ error: "Query Deficit" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await canUser('MUTATE_DATA'))) return RoleDenialResponse();

    const org = await getAuthOrg();
    const { name, rules } = await request.json();

    if (!name || !rules) {
      return NextResponse.json({ error: "Incomplete definition vector." }, { status: 400 });
    }

    const newSegment = await prisma.segment.create({
      data: {
        orgId: org.id,
        name,
        rules // Json saved directly
      }
    });

    return NextResponse.json(newSegment);
  } catch (err) {
    return NextResponse.json({ error: "Syntactic logic error during persist." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await canUser('MUTATE_DATA'))) return RoleDenialResponse();
    
    const org = await getAuthOrg();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Missing target key." }, { status: 400 });

    await prisma.segment.delete({
      where: {
        id,
        orgId: org.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Segment collapse vetoed." }, { status: 500 });
  }
}
