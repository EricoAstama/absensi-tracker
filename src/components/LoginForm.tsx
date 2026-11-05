"use client";
import { useState } from "react";
import { Eye, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    if (authError || !data.user) { setError("Email atau kata sandi tidak valid."); setLoading(false); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    window.location.href = profile?.role === "employee" ? "/employee" : "/hc";
  }
  return <form className="w-full max-w-sm" onSubmit={submit}>
    <p className="label">Selamat datang</p><h2 className="text-3xl font-black mt-2">Masuk ke Hadir</h2>
    <p className="text-sm text-[var(--muted)] mt-2 mb-7">Gunakan akun kantor untuk melanjutkan.</p>
    <label className="label" htmlFor="email">Email</label><div className="relative mt-2 mb-4"><Mail size={17} className="absolute left-3 top-3.5 text-gray-400"/><input id="email" name="email" className="field pl-10" type="email" autoComplete="email" required/></div>
    <label className="label" htmlFor="password">Kata sandi</label><div className="relative mt-2"><Lock size={17} className="absolute left-3 top-3.5 text-gray-400"/><input id="password" name="password" className="field px-10" type="password" autoComplete="current-password" required/><Eye size={17} className="absolute right-3 top-3.5 text-gray-400"/></div>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={loading} className="btn btn-primary w-full mt-6 disabled:opacity-50">{loading ? "Memeriksa…" : "Masuk"}</button>
  </form>;
}
