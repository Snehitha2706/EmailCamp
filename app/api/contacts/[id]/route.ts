import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const org = await getAuthOrg();
    const { id } = await params;

    if (!id) return NextResponse.json({ error: "Target deficit" }, { status: 400 });

    // Double conditional locking secures delete behind active authority validation.
    const deletion = await prisma.contact.deleteMany({
      where: {
        id: id,
        orgId: org.id
      }
    });

    if (deletion.count === 0) {
      return NextResponse.json({ error: "Unauthorized or missing" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Physical record erased." });

  } catch (err) {
    console.error("Delete fracture:", err);
    return NextResponse.json({ error: "Destruction protocol error" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const org = await getAuthOrg();
    const { id } = await params;

    const contact = await prisma.contact.findFirst({
      where: { id, orgId: org.id },
      include: {
        listMemberships: { include: { list: true } },
        events: {
          orderBy: { occurredAt: 'desc' },
          include: { campaign: { select: { name: true } } },
          take: 50
        },
        _count: { select: { events: true } }
      }
    });

    if (!contact) return NextResponse.json({ error: "Identity not located." }, { status: 404 });

    return NextResponse.json(contact);
  } catch (err) {
    return NextResponse.json({ error: "Timeline query failure" }, { status: 500 });
  }
}
