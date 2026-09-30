import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <span className="inline-block px-3 py-1.5 rounded-full border border-border text-muted text-sm">
        CLIPMITRA AI • MVP
      </span>

      <h1 className="text-4xl md:text-5xl font-bold mt-5 mb-3 leading-tight">
        एक वीडियो से पूरा Content.
      </h1>

      <p className="text-lg text-muted max-w-2xl mb-10">
        Long video upload karo aur AI se best short clips, hooks, captions
        aur hashtags ka poora content package taiyaar karo — Hindi &
        Haryanvi creators ke liye.
      </p>

      <div className="flex gap-3 mb-16">
        <Link
          href="/signup"
          className="bg-white text-base font-bold rounded-xl px-6 py-3 hover:opacity-90 transition"
        >
          Free mein shuru karein
        </Link>
        <Link
          href="/login"
          className="border border-border rounded-xl px-6 py-3 text-muted hover:text-white hover:border-white/40 transition"
        >
          Login
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            title: "AI Clip Finder",
            desc: "Best dialogue, comedy aur emotional moments automatically dhoondhta hai.",
          },
          {
            title: "Hindi/Haryanvi Captions",
            desc: "Natural desi-style captions, hooks aur hashtags — copy-paste ready.",
          },
          {
            title: "9:16 Auto Reels",
            desc: "Subtitle ke saath vertical reel export, YouTube Shorts ke liye ready.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-panel border border-border rounded-xl2 p-5"
          >
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-muted text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
