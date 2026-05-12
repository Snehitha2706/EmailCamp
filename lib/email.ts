import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

interface EmailPayload {
  to: string;
  from: string;
  subject: string;
  html: string;
  // Allow dynamic credentials to be passed in from the caller/database!
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
  credentials
}: EmailPayload) {
  
  // Create an on-the-fly client using DB-sourced configuration if available
  // Fall back to standard environment variables for test mode
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

  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: html,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: from,
  });

  try {
    const response = await client.send(command);
    return { success: true, messageId: response.MessageId };
  } catch (error: any) {
    console.error("DYNAMIC AWS SES FAULT:", error);
    throw new Error(`SES Dispatch Failed: ${error.message || "Unknown error"}`);
  }
}
