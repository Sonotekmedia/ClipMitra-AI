import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/projects — list only the logged-in user's projects
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
    include: { video: true, clips: true },
  });

  return NextResponse.json(projects);
}

const createProjectSchema = z.object({
  name: z.string().min(1),
  language: z.enum(["Hindi", "Haryanvi", "Hinglish", "English"]).default("Hindi"),
  contentType: z.array(z.string()).default([]),
});

// POST /api/projects — create a new project (video attached separately via /api/upload)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      ownerId: (session.user as any).id,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
