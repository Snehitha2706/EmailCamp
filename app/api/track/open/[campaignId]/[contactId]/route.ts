import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campaignId: string, contactId: string }> }
) {
  try {
    const { campaignId, contactId } = await params;

    // Record the real-time interaction event atomically!
    await prisma.emailEvent.create({
      data: {
        campaignId,
        contactId,
        eventType: 'open',
        metadata: {
          agent: request.headers.get('user-agent'),
          referrer: request.headers.get('referer')
        }
      }
    });

    // Return a completely transparent 1x1 pixel gif binary byte buffer
    const buffer = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (err) {
    // Silently fail if logging failed to ensure pixel loads without broken image icon
    const buffer = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    return new NextResponse(buffer, { headers: { 'Content-Type': 'image/gif' } });
  }
}
