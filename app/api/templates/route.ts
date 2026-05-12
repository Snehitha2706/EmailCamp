import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg } from '@/lib/auth';

export async function GET() {
  try {
    const org = await getAuthOrg();
    const tpls = await prisma.template.findMany({
      where: { orgId: org.id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(tpls);
  } catch (e) {
    return NextResponse.json({ error: "Identity or sync failure" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const org = await getAuthOrg();
    const { name, html, category } = await request.json();

    const tpl = await prisma.template.create({
      data: {
        orgId: org.id,
        name: name || "Untitled Canvas",
        html: html || "<div></div>",
        category: category || "Draft"
      }
    });

    return NextResponse.json(tpl);
  } catch (e) {
    return NextResponse.json({ error: "Mutation failed" }, { status: 500 });
  }
}
