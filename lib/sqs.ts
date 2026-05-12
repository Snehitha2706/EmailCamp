import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const region = process.env.AWS_REGION || "ap-south-1";
const queueUrl = process.env.AWS_SQS_QUEUE_URL || "";

const sqsClient = new SQSClient({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function queueEmailJob(payload: any) {
  if (!queueUrl) {
    console.error("CRITICAL: No SQS queue URL defined in environment.");
    return null;
  }

  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(payload),
  });

  try {
    const response = await sqsClient.send(command);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error("AWS SQS Dispatch Failure:", error);
    return { success: false, error };
  }
}

export default sqsClient;
