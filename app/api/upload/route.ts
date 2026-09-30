import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isStorageConfigured,
  isLocalStorageMode,
  createPresignedUploadUrl,
  buildVideoKey,
} from "@/lib/storage";

const requestSchema = z.object({
  projectId: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
});

// POST /api/upload
// Step 1 of the upload flow: client asks us for an upload URL,
// then uploads the actual video bytes directly to that URL (see
// /api/upload/complete for step 2, which records the upload in the database).
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { projectId, fileName, contentType } = parsed.data;

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: (session.user as any).id },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const key = buildVideoKey(projectId, fileName);

  if (isStorageConfigured()) {
    const uploadUrl = await createPresignedUploadUrl(key, contentType);
    return NextResponse.json({ uploadUrl, key });
  }

  if (isLocalStorageMode()) {
    // R2 not set up yet — fall back to uploading straight to our own
    // server, which saves the file to /public/uploads on disk.
    const uploadUrl = `/api/upload/local?key=${encodeURIComponent(key)}`;
    return NextResponse.json({ uploadUrl, key });
  }

  return NextResponse.json(
    { error: "Requires configuration", message: "Storage set up nahi hai." },
    { status: 501 }
  );
}
EOFmkdir -p app/api/upload/local
cat > app/api/upload/local/route.ts << 'EOF'
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveLocalFile } from "@/lib/storage";

// PUT /api/upload/local?key=videos/xxx/file.mp4
// Receives the raw video bytes and saves them to /public/uploads on disk.
// This mirrors what a presigned R2 PUT would do, but locally.
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const arrayBuffer = await req.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await saveLocalFile(key, buffer);

  return NextResponse.json({ success: true, key });
}
EOFcat >> lib/storage.ts << 'EOF'

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
}cd ~/Downloads/clipmitra-ai
