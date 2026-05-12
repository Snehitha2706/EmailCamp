import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";

interface EmailPayload {
  to: string;
  from: string;
  subject: string;
  html: string;
  headers?: Record<string, string>; // NEW: Supports custom injectables like List-Unsubscribe
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
    region?: string;
  };
}

export async function sendEmail({
  to,
  from,
  subject,
  html,
  headers = {},
  credentials
}: EmailPayload) {
  
  const region = credentials?.region || process.env.AWS_REGION || "ap-south-1";
  
  const client = new SESClient({
    region,
    credentials: credentials?.accessKeyId ? {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    } : {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
  });

  // 🔥 RFC822 MIME Assembly for Header Control
  const headerBuffer: string[] = [
    `From: ${from}`,
    `To: ${to}`,
    // Standard UTF-8 Safe encoding for subject lines
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`
  ];

  // Inject customized system headers
  Object.entries(headers).forEach(([key, val]) => {
    if (val) headerBuffer.push(`${key}: ${val}`);
  });

  // Complete the stream with double CRLF break to body
  const rawMessage = headerBuffer.join("\r\n") + "\r\n\r\n" + html;

  const command = new SendRawEmailCommand({
    RawMessage: {
      Data: Buffer.from(rawMessage, 'utf-8'),
    },
    Source: from
  });

  try {
    const response = await client.send(command);
    return { success: true, messageId: response.MessageId };
  } catch (error: any) {
    console.error("DYNAMIC AWS SES RAW FAULT:", error);
    throw new Error(`SES Raw Dispatch Failed: ${error.message || "Unknown error"}`);
  }
}
