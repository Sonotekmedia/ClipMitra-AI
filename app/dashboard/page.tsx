import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ProjectWithRelations = {
  id: string;
  name: string;
  language: string;
  status: string;
  clips: { id: string }[];
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { ownerId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
    include: { video: true, clips: true },
  });

  const totalClips = projects.reduce(
    (sum: number, p: ProjectWithRelations) => sum + p.clips.length,
    0
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted text-sm">
            {session.user.name || session.user.email}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="bg-white text-base font-bold rounded-lg px-5 py-2.5"
        >
          + Naya Project
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <Stat label="Total Projects" value={projects.length} />
        <Stat
          label="Videos Processed"
          value={
            projects.filter((p: ProjectWithRelations) => p.status === "COMPLETED")
              .length
          }
        />
        <Stat label="Clips Generated" value={totalClips} />
      </div>

      <h2 className="text-lg font-semibold mb-4">Recent Projects</h2>

      {projects.length === 0 ? (
        <div className="bg-panel border border-border rounded-xl2 p-10 text-center text-muted">
          Abhi koi project nahi hai. Pehla project banayein aur video upload
          karein.
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p: ProjectWithRelations) => (
            <div
              key={p.id}
              className="bg-panel border border-border rounded-xl2 p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-muted text-sm">
                  {p.language} • {p.clips.length} clips • {p.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-panel2 rounded-xl2 p-4">
      <span className="text-muted text-sm">{label}</span>
      <b className="block text-2xl mt-1">{value}</b>
    </div>
  );
}
