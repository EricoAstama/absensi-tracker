"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff, KeyRound, Plus, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";

type Employee = {
  id: string;
  full_name: string;
  department: string | null;
  created_at: string | null;
};

type CreatedAccount = { fullName: string; email: string; password: string };

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return `Hadir${Array.from(bytes, value => alphabet[value % alphabet.length]).join("")}7`;
}

export function EmployeeManager({ employees, canManage }: { employees: Employee[]; canManage: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const payload = {
      fullName: String(values.get("fullName") || ""),
      email: String(values.get("email") || ""),
      department: String(values.get("department") || ""),
      password,
    };

    setSaving(true);
    setMessage("");
    setCreatedAccount(null);
    try {
      const response = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) {
        setMessage(result.message || "Employee gagal ditambahkan.");
        return;
      }

      setCreatedAccount({ fullName: payload.fullName.trim(), email: payload.email.trim().toLowerCase(), password });
      setMessage("Employee berhasil ditambahkan dan dapat langsung login.");
      form.reset();
      setPassword("");
      router.refresh();
    } catch {
      setMessage("Koneksi terputus. Periksa jaringan lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function copyCredentials() {
    if (!createdAccount) return;
    try {
      await navigator.clipboard.writeText(`Email: ${createdAccount.email}\nPassword sementara: ${createdAccount.password}`);
      setMessage("Email dan password sementara sudah disalin.");
    } catch {
      setMessage("Clipboard tidak tersedia. Salin kredensial secara manual.");
    }
  }

  return <section className="space-y-4">
    <div className="panel overflow-hidden">
      <div className="p-5 sm:p-6 flex items-start justify-between gap-3">
        <div><p className="label">Master data</p><h2 className="font-black text-xl mt-1">Employee</h2><p className="text-sm text-[var(--muted)] mt-2">{employees.length} akun employee terdaftar</p></div>
        <Users className="text-[#196c4a] shrink-0" />
      </div>
      <div className="max-h-72 overflow-y-auto">
        {employees.map(employee => <article key={employee.id} className="px-5 sm:px-6 py-4 border-t border-[var(--line)] flex items-center gap-3">
          <span className="h-10 w-10 rounded-full bg-[#e2eee7] grid place-items-center text-xs font-black shrink-0">{employee.full_name.split(" ").map(value => value[0]).slice(0, 2).join("").toUpperCase()}</span>
          <div className="min-w-0"><p className="font-bold text-sm truncate">{employee.full_name}</p><p className="text-xs text-[var(--muted)] truncate">{employee.department || "Tanpa departemen"}</p></div>
        </article>)}
        {!employees.length && <p className="px-5 sm:px-6 py-6 border-t border-[var(--line)] text-sm text-[var(--muted)]">Belum ada akun employee.</p>}
      </div>
    </div>

    {canManage ? <form onSubmit={submit} className="panel p-5 sm:p-6" noValidate>
      <div className="flex items-center gap-3 mb-5"><span className="h-10 w-10 rounded-xl bg-[#e5f7ed] text-[#196c4a] grid place-items-center"><UserPlus size={19} /></span><div><p className="label">Superadmin</p><h2 className="text-lg font-black">Tambah employee</h2></div></div>
      <div className="space-y-4">
        <div><label htmlFor="employee-name" className="label">Nama lengkap</label><input id="employee-name" name="fullName" className="field mt-2" minLength={2} maxLength={100} autoComplete="name" required placeholder="Nama employee" /></div>
        <div><label htmlFor="employee-email" className="label">Email login</label><input id="employee-email" name="email" className="field mt-2" type="email" maxLength={254} autoComplete="off" required placeholder="nama@perusahaan.com" /></div>
        <div><label htmlFor="employee-department" className="label">Departemen</label><input id="employee-department" name="department" className="field mt-2" minLength={2} maxLength={80} required placeholder="Contoh: Finance" /></div>
        <div>
          <div className="flex items-center justify-between gap-3"><label htmlFor="employee-password" className="label">Password sementara</label><button type="button" className="text-xs font-bold text-[#196c4a]" onClick={() => setPassword(generatePassword())}><KeyRound size={13} className="inline mr-1" />Buat otomatis</button></div>
          <div className="relative mt-2"><input id="employee-password" name="password" className="field pr-12" type={showPassword ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} minLength={8} maxLength={72} pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,72}" title="Gunakan 8–72 karakter yang memuat huruf dan angka" autoComplete="new-password" required placeholder="Minimal 8 karakter" /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute inset-y-0 right-0 w-11 grid place-items-center text-[var(--muted)]" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          <p className="text-xs text-[var(--muted)] mt-2">Gunakan huruf dan angka. Bagikan secara aman kepada employee.</p>
        </div>
      </div>

      {createdAccount && <div className="mt-4 rounded-xl bg-[#e5f7ed] p-4 text-sm text-[#176b49]"><p className="font-bold">Simpan kredensial {createdAccount.fullName} sekarang.</p><dl className="mt-2 space-y-1"><div><dt className="inline font-bold">Email: </dt><dd className="inline break-all">{createdAccount.email}</dd></div><div><dt className="inline font-bold">Password: </dt><dd className="inline break-all font-mono">{createdAccount.password}</dd></div></dl><button type="button" onClick={copyCredentials} className="btn btn-secondary mt-3 w-full"><Copy size={15} />Salin email & password</button></div>}
      {message && <p role="status" className={`mt-4 rounded-xl p-3 text-sm ${message.includes("berhasil") || message.includes("disalin") ? "bg-[#e5f7ed] text-[#176b49]" : "bg-red-50 text-red-700"}`}>{message}</p>}
      <button disabled={saving} className="btn btn-primary w-full mt-5 disabled:opacity-50"><Plus size={16} />{saving ? "Membuat akun…" : "Tambah employee"}</button>
    </form> : <div className="panel p-5 text-sm text-[var(--muted)]">Daftar employee dapat dilihat oleh HC Admin. Pembuatan akun hanya tersedia untuk Superadmin.</div>}
  </section>;
}
