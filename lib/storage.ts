import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 is S3-compatible, so we use the AWS SDK pointed at the R2 endpoint.
// Required env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function isStorageConfigured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
  );
}

// Generates a short-lived URL the browser can upload directly to.
// This avoids passing large video files through our own server.
export async function createPresignedUploadUrl(key: string, contentType: string) {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  if (!client || !bucket) throw new Error("Storage not configured");

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  // Valid for 15 minutes — enough time to upload a large video on a normal connection.
  return getSignedUrl(client, command, { expiresIn: 900 });
}

// Generates a short-lived URL the browser can use to view/download the video.
export async function createPresignedGetUrl(key: string) {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  if (!client || !bucket) throw new Error("Storage not configured");

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}

export function buildVideoKey(projectId: string, fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  return `videos/${projectId}/${Date.now()}-${safe}`;
}

// ----- LOCAL STORAGE FALLBACK (for development without R2/card) -----
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export function isLocalStorageMode() {
  return !isStorageConfigured();
}

export async function saveLocalFile(key: string, buffer: Buffer) {
  const filePath = path.join(LOCAL_UPLOAD_DIR, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  return `/uploads/${key}`;
}
