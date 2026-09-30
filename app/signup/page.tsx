"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Signup fail ho gaya");
      return;
    }

    router.push("/login");
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-20">
      <h1 className="text-2xl font-bold mb-6">Account banayein</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Naam"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-panel border border-border rounded-lg px-4 py-3 outline-none focus:border-accent"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-panel border border-border rounded-lg px-4 py-3 outline-none focus:border-accent"
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-panel border border-border rounded-lg px-4 py-3 outline-none focus:border-accent"
          required
        />

        {error && <p className="text-accent text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-base font-bold rounded-lg px-4 py-3 disabled:opacity-50"
        >
          {loading ? "Ban raha hai..." : "Sign up"}
        </button>
      </form>

      <p className="text-muted text-sm mt-5">
        Pehle se account hai?{" "}
        <Link href="/login" className="text-white underline">
          Login karein
        </Link>
      </p>
    </main>
  );
}
