import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    // 1. Inspect naked body payload
    const rawBody = await request.text();
    let body: any;
    
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      // AWS sometimes requires raw JSON handling, fail gracefully if invalid.
      return NextResponse.json({ error: "Invalid JSON frame" }, { status: 400 });
    }

    // 🔥 CASE A: AWS SNS Subscription Handshake (Verification Step)
    if (body.Type === "SubscriptionConfirmation") {
      console.log("🔔 AWS SNS Handshake Requested. URL:", body.SubscribeURL);
      
      // Automatically visit the SubscribeURL to finalize AWS connection immediately.
      if (body.SubscribeURL) {
        await fetch(body.SubscribeURL);
        console.log("✅ AWS SNS Subscription Physically Confirmed!");
      }
      
      return NextResponse.json({ status: "confirmed" });
    }

    // 🔥 CASE B: Active Notification Event (Bounce / Complaint / Delivery)
    if (body.Type === "Notification") {
      // SNS embeds the true payload as a string inside 'Message' property.
      const innerMsg = typeof body.Message === 'string' ? JSON.parse(body.Message) : body.Message;
      const eventType = innerMsg.notificationType; // 'Bounce' | 'Complaint' | 'Delivery'
      const awsMsgId = innerMsg.mail?.messageId;

      if (!awsMsgId) {
        return NextResponse.json({ status: "ignored", reason: "No message id found" });
      }

      console.log(`📨 Incoming SES Event: ${eventType} for MSG_ID: ${awsMsgId}`);

      // Locate the authoritative campaign record to isolate Org & Contact
      const sendRecord = await prisma.campaignSend.findFirst({
        where: { sesMessageId: awsMsgId },
        include: { campaign: true }
      });

      if (!sendRecord) {
        console.log("❓ Trace Lost: AWS Message ID not found in CampaignSend records.");
        return NextResponse.json({ status: "not_found" });
      }

      const { contactId, campaignId } = sendRecord;
      const orgId = sendRecord.campaign.orgId;

      // 1. Update Global Event Log (M9 Analytics)
      await prisma.emailEvent.create({
        data: {
          contactId,
          campaignId,
          eventType: eventType.toLowerCase(), // stores as 'bounce', 'complaint', etc.
          metadata: innerMsg
        }
      });

      // 2. Take Legal Remediation Steps (M7 Compliance)
      if (eventType === 'Bounce' || eventType === 'Complaint') {
        const actionStatus = eventType === 'Bounce' ? 'bounced' : 'complained';

        // A. Terminate active contact sending state immediately
        await prisma.contact.update({
          where: { id: contactId },
          data: { status: actionStatus }
        });

        // B. Append to global suppression registry permanently
        // First get the contact email to store in suppression
        const contact = await prisma.contact.findUnique({ where: { id: contactId } });
        
        if (contact?.email) {
          await prisma.suppressionEntry.upsert({
            where: { orgId_email: { orgId, email: contact.email } },
            update: { reason: actionStatus },
            create: {
              orgId,
              email: contact.email,
              reason: actionStatus
            }
          });
        }
        console.log(`🚫 COMPLIANCE: Blacklisted ${contact?.email} as ${actionStatus} on Org ${orgId}`);
      }

      return NextResponse.json({ status: "processed" });
    }

    // Implicit ignore for other AWS types (e.g. UnsubscribeConfirmation)
    return NextResponse.json({ status: "ignored" });

  } catch (err: any) {
    console.error("⚠️ WEBHOOK TRAP CRITICAL:", err.message);
    // Always return 200 to AWS unless we want them to keep retrying and flooding us.
    return NextResponse.json({ error: "Internal Fault but trapping" }, { status: 200 });
  }
}
