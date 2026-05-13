import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const org = await getAuthOrg();
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');
    
    const whereClause: any = { orgId: org.id };
    
    if (listId) {
      whereClause.listMemberships = {
        some: { listId: listId }
      };
    }

    const contacts = await prisma.contact.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        listMemberships: {
          include: { list: true }
        }
      }
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    return NextResponse.json({ error: "Failed to load audience" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const org = await getAuthOrg();
    const { email, firstName, lastName, listId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Missing parameter" }, { status: 400 });
    }

    const newContact = await prisma.contact.create({
      data: {
        orgId: org.id,
        email: email.trim().toLowerCase(),
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        status: 'active',
        source: 'manual',
        listMemberships: listId ? {
          create: {
            listId: listId
          }
        } : undefined
      }
    });
    
    // Activate Automation Engine Dispatcher (Asynchronous Background fire)
    import('@/lib/automationEngine').then(({ triggerAutomationEvent }) => {
      triggerAutomationEvent({
        type: 'CONTACT_CREATED',
        orgId: org.id,
        contactId: newContact.id
      }).catch(console.error);
    });

    return NextResponse.json(newContact);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Already exists" }, { status: 409 });
    }
    console.error("Creation failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
