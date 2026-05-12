import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION || "ap-south-1";

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Generates a temporary secure URL for direct browser uploads to save user server overhead
 */
export async function generateUploadUrl(bucketName: string, key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    return { uploadUrl: signedUrl, publicUrl };
  } catch (error) {
    console.error("AWS S3 Signing Failure:", error);
    return null;
  }
}

export default s3Client;
