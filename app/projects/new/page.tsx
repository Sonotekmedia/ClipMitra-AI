"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LANGUAGES = ["Hindi", "Haryanvi", "Hinglish", "English"];
const CONTENT_TYPES = [
  "Comedy",
  "Emotional",
  "Dialogue",
  "Action",
  "Entertainment",
  "Nostalgia",
  "Motivational",
  "Music/Ragni",
];

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [contentType, setContentType] = useState<string[]>(["Comedy"]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [stage, setStage] = useState<"" | "creating" | "uploading" | "saving">("");

  function toggleType(t: string) {
    setContentType((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  // Uploads the file directly to R2 using the presigned URL, reporting
  // progress via XMLHttpRequest (fetch doesn't expose upload progress).
  function uploadWithProgress(url: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadPct(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed with status ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setStage("creating");

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, language, contentType }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Project create nahi ho paaya");
      setLoading(false);
      setStage("");
      return;
    }

    const project = await res.json();

    if (file) {
      try {
        setStage("uploading");

        const presignRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
          }),
        });

        if (!presignRes.ok) {
          const data = await presignRes.json();
          // Storage not configured — project is still created, just note it.
          setError(
            data.message ||
              "Project ban gaya, lekin video storage abhi configure nahi hai."
          );
          setLoading(false);
          setStage("");
          router.push("/dashboard");
          router.refresh();
          return;
        }

        const { uploadUrl, key } = await presignRes.json();

        await uploadWithProgress(uploadUrl, file);

        setStage("saving");
        await fetch("/api/upload/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            key,
            fileSizeBytes: file.size,
          }),
        });
      } catch (err) {
        setError("Video upload fail ho gaya. Project ban gaya hai, dobara try kar sakte hain.");
        setLoading(false);
        setStage("");
        router.push("/dashboard");
        router.refresh();
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-14">
      <h1 className="text-2xl font-bold mb-6">Naya Project</h1>

      <form onSubmit={handleCreate} className="space-y-6">
        <div>
          <label className="text-muted text-sm block mb-2">
            Project / Film ka naam
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-panel border border-border rounded-lg px-4 py-3 outline-none focus:border-accent"
            placeholder="e.g. Rajlaxmi Movies — Episode 12"
            required
          />
        </div>

        <div>
          <label className="text-muted text-sm block mb-2">Language</label>
          <div className="flex gap-2 flex-wrap">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  language === l
                    ? "bg-white text-base border-white"
                    : "border-border text-muted"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-muted text-sm block mb-2">
            Content types
          </label>
          <div className="flex gap-2 flex-wrap">
            {CONTENT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  contentType.includes(t)
                    ? "bg-white text-base border-white"
                    : "border-border text-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-muted text-sm block mb-2">
            Video upload
          </label>
          <div className="border-2 border-dashed border-border rounded-xl2 p-8 text-center">
            <input
              type="file"
              accept="video/*"
              id="video-file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="video-file" className="cursor-pointer">
              <p className="mb-2">{file ? file.name : "Video file chunein"}</p>
              <span className="text-muted text-sm">MP4, MOV, MKV</span>
            </label>
          </div>
        </div>

        {stage === "uploading" && (
          <div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${uploadPct}%` }}
              />
            </div>
            <p className="text-muted text-sm mt-2">
              Video upload ho raha hai... {uploadPct}%
            </p>
          </div>
        )}
        {stage === "saving" && (
          <p className="text-muted text-sm">Save ho raha hai...</p>
        )}

        {error && <p className="text-accent text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !name}
          className="w-full bg-white text-base font-bold rounded-lg px-4 py-3 disabled:opacity-50"
        >
          {loading
            ? stage === "uploading"
              ? `Upload ho raha hai... ${uploadPct}%`
              : "Ban raha hai..."
            : "Project banayein"}
        </button>
      </form>
    </main>
  );
}
