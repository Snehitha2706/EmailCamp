import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { to, subject, content } = await request.json();

    if (!to || !subject) {
      return NextResponse.json({ error: "Invalid verification target" }, { status: 400 });
    }

    // Read default verified sender from node runtime vars
    const fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL;

    if (!fromEmail) {
      return NextResponse.json({ error: "Operational fault: No verified sender defined." }, { status: 500 });
    }

    console.log(`🚀 EXECUTING PHYSICAL AWS SES INJECTION TO: ${to}`);

    const result = await sendEmail({
      to,
      from: fromEmail,
      subject: subject,
      html: content || `<h1>Platform Test Success</h1><p>The physical relay layer is 100% nominal.</p>`
    });

    if (result?.success) {
      // Log the verification run locally
      await prisma.campaign.create({
        data: {
          name: `Self-Test Delivery`,
          subject: subject,
          status: "sent",
          orgId: (await prisma.organisation.findFirst())?.id || "sys"
        }
      });

      return NextResponse.json({ 
        success: true, 
        messageId: result.messageId 
      });
    } else {
      throw new Error("SES injection rejection received.");
    }

  } catch (err: any) {
    console.error("Physical dispatch pipeline failed:", err);
    return NextResponse.json({ 
      error: "Pipeline rejection", 
      details: err?.message || "Internal driver exception" 
    }, { status: 500 });
  }
}
