import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const PROJECT_REF = process.env
  .NEXT_PUBLIC_SUPABASE_URL!.replace("https://", "")
  .replace(".supabase.co", "");

export function createS3Client() {
  return new S3Client({
    forcePathStyle: true,
    region: "eu-west-1",
    endpoint: "https://purtpeccwhadtwzqgkma.storage.supabase.co/storage/v1/s3",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
}

export function extractS3Key(fileUrl: string): string {
  // Public URL format: https://ref.supabase.co/storage/v1/object/public/BUCKET/KEY
  // Signed URL format: https://ref.supabase.co/storage/v1/object/sign/BUCKET/KEY?...
  const match = fileUrl.match(
    /\/object\/(?:public|sign)\/[^/]+\/(.+?)(?:\?|$)/,
  );
  return match?.[1] ?? fileUrl;
}

export async function getPresignedUrl(
  bucket: string,
  fileUrl: string,
  expiresInSeconds = 300,
): Promise<string> {
  const key = extractS3Key(fileUrl);
  const s3 = createS3Client();
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}
