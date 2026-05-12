import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campId = searchParams.get('camp');
    const contId = searchParams.get('cont');
    const destination = searchParams.get('dest');

    // Critical safety check to prevent redirect hijacking/loops
    if (!destination) {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }

    // Fire-and-forget tracking to ensure immediate user redirect without blocking
    if (campId && contId) {
      // We log the physical event async so browser redirect stays fast
      prisma.emailEvent.create({
        data: {
          campaignId: campId,
          contactId: contId,
          eventType: 'click',
          metadata: { url: destination }
        }
      }).catch(err => console.error("Track Log deficit:", err));
    }

    // Absolute 302 forward to the external destination instantly!
    return NextResponse.redirect(destination, 302);

  } catch (e) {
    return NextResponse.json({ error: "Forward collapsed" }, { status: 500 });
  }
}
