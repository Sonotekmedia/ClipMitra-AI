import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const completeSchema = z.object({
  projectId: z.string().min(1),
  key: z.string().min(1),
  fileSizeBytes: z.number().optional(),
});

// POST /api/upload/complete
// Step 2 of the upload flow: called after the browser successfully uploaded
// the video bytes directly to R2 using the presigned URL from /api/upload.
// This records the video in the database and marks the project ready for
// AI processing (Phase 3).
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { projectId, key, fileSizeBytes } = parsed.data;

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: (session.user as any).id },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const video = await prisma.video.upsert({
    where: { projectId },
    create: {
      projectId,
      originalUrl: key,
      fileSizeBytes: fileSizeBytes ? BigInt(fileSizeBytes) : undefined,
    },
    update: {
      originalUrl: key,
      fileSizeBytes: fileSizeBytes ? BigInt(fileSizeBytes) : undefined,
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "ANALYZING_AUDIO" }, // ready for Phase 3 processing
  });

  return NextResponse.json({
    id: video.id,
    projectId: video.projectId,
    message: "Video upload ho gaya. AI processing Phase 3 mein add hogi.",
  });
}
