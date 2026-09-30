"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ya password galat hai");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-20">
      <h1 className="text-2xl font-bold mb-6">Login karein</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Password"
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
          {loading ? "Login ho raha hai..." : "Login"}
        </button>
      </form>

      <p className="text-muted text-sm mt-5">
        Account nahi hai?{" "}
        <Link href="/signup" className="text-white underline">
          Sign up karein
        </Link>
      </p>
    </main>
  );
}
