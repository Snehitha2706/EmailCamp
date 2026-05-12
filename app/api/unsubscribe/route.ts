import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { contactId, campaignId } = await request.json();

    if (!contactId) {
      return NextResponse.json({ error: "Identifier Deficit" }, { status: 400 });
    }

    // Atomic Status Shift to 'unsubscribed' - globally safe!
    await prisma.contact.update({
      where: { id: contactId },
      data: { status: 'unsubscribed' }
    });

    // Log the interaction event
    if (campaignId) {
      await prisma.emailEvent.create({
        data: {
          campaignId,
          contactId,
          eventType: 'unsubscribe',
          metadata: { source: 'web-click' }
        }
      });
    }

    return NextResponse.json({ success: true, message: "Status Revocation Completed." });

  } catch (err) {
    return NextResponse.json({ error: "Internal Matrix Fault" }, { status: 500 });
  }
}
