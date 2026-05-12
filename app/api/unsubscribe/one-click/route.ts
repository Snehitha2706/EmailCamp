import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * RFC 8058 One-Click Unsubscribe Receiver
 * This is invoked automatically by modern email software (Gmail, Yahoo, Apple Mail)
 * directly when the user clicks "Unsubscribe" in the native inbox interface.
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('cid');
    const campaignId = searchParams.get('camp');

    // RFC 8058 specifies the client sends the exact string in the POST body.
    // While it can be raw text/plain or form-encoded, we primarily just ensure ID identity exists.
    if (!contactId) {
      return NextResponse.json({ error: "Missing Identifier" }, { status: 400 });
    }

    console.log(`🛡️ RFC 8058 ONE-CLICK VOID: Contact ${contactId} triggering direct revocation.`);

    // 1. Update state to 'unsubscribed' instantly
    await prisma.contact.update({
      where: { id: contactId },
      data: { status: 'unsubscribed' }
    });

    // 2. Log compliance audit trail
    if (campaignId) {
      await prisma.emailEvent.create({
        data: {
          campaignId,
          contactId,
          eventType: 'unsubscribe',
          metadata: { source: 'one-click-rfc8058' }
        }
      });
    }

    // Standards request a 200 OK response acknowledging the unsubscribe
    return NextResponse.json({ success: true, status: "acknowledged" });

  } catch (err: any) {
    console.error("🛑 RFC8058 HANDLER COLLAPSE:", err.message);
    // Respond with 200 anyway to ensure standard client compliance (we don't want loops)
    return NextResponse.json({ status: "suppressed" }, { status: 200 });
  }
}
