import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg, canUser, RoleDenialResponse } from '@/lib/auth';

export async function GET() {
  try {
    const org = await getAuthOrg();
    const lists = await prisma.contactList.findMany({
      where: { orgId: org.id },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(lists);
  } catch (err) {
    return NextResponse.json({ error: "Query deficit" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await canUser('MUTATE_DATA'))) {
      return RoleDenialResponse();
    }

    const org = await getAuthOrg();
    const { name, description } = await request.json();

    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const newList = await prisma.contactList.create({
      data: {
        orgId: org.id,
        name,
        description
      }
    });

    return NextResponse.json(newList);
  } catch (err) {
    return NextResponse.json({ error: "Creation deficit" }, { status: 500 });
  }
}
