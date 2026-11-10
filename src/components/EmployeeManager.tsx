"use client";

import { useRef, useState } from "react";
import { Copy, Eye, EyeOff, KeyRound, Pencil, Plus, Trash2, UserPlus, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";

type ManagedRole = "employee" | "hc_admin";

type Account = {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  role: ManagedRole;
};

type EmployeeDraft = { fullName: string; email: string; department: string; password: string; role: ManagedRole };
type CreatedAccount = { fullName: string; email: string; password: string };

const emptyDraft: EmployeeDraft = { fullName: "", email: "", department: "", password: "", role: "employee" };

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return `Hadir${Array.from(bytes, value => alphabet[value % alphabet.length]).join("")}7`;
}

export function EmployeeManager({ accounts, canManage }: { accounts: Account[]; canManage: boolean }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState<EmployeeDraft>(emptyDraft);
  const [editing, setEditing] = useState<Account | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null);

  function change(field: keyof EmployeeDraft, value: string) {
    setDraft(current => ({ ...current, [field]: value }));
  }

  function startEdit(account: Account) {
    setEditing(account);
    setDraft({ fullName: account.full_name, email: account.email, department: account.department || "", password: "", role: account.role });
    setCreatedAccount(null);
    setMessage("");
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function resetForm() {
    setEditing(null);
    setDraft(emptyDraft);
    setShowPassword(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;

    setSaving(true);
    setMessage("");
    setCreatedAccount(null);
    try {
      const response = await fetch(editing ? `/api/admin/employees/${editing.id}` : "/api/admin/employees", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) {
        setMessage(result.message || "Akun pengguna gagal disimpan.");
        return;
      }

      if (!editing) {
        setCreatedAccount({ fullName: draft.fullName.trim(), email: draft.email.trim().toLowerCase(), password: draft.password });
      }
      setMessage(result.message || (editing ? "Akun pengguna berhasil diperbarui." : "Akun pengguna berhasil ditambahkan dan dapat langsung login."));
      resetForm();
      router.refresh();
    } catch {
      setMessage("Koneksi terputus. Periksa jaringan lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(account: Account) {
    const confirmed = window.confirm(`Hapus ${account.full_name}? Akun login dan data terkait akan ikut dihapus permanen.`);
    if (!confirmed) return;
    setDeletingId(account.id);
    setMessage("");
    setCreatedAccount(null);
    try {
      const response = await fetch(`/api/admin/employees/${account.id}`, { method: "DELETE" });
      const result = await response.json() as { message?: string };
      setMessage(result.message || (response.ok ? "Akun pengguna berhasil dihapus." : "Akun pengguna gagal dihapus."));
      if (response.ok) {
        if (editing?.id === account.id) resetForm();
        router.refresh();
      }
    } catch {
      setMessage("Koneksi terputus. Akun pengguna belum dihapus.");
    } finally {
      setDeletingId("");
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
        <div><p className="label">Master data</p><h2 className="font-black text-xl mt-1">Akun pengguna</h2><p className="text-sm text-[var(--muted)] mt-2">{accounts.filter(account => account.role === "employee").length} Employee · {accounts.filter(account => account.role === "hc_admin").length} HC Admin</p></div>
        <Users className="text-[#196c4a] shrink-0" />
      </div>
      <div className="max-h-80 overflow-y-auto">
        {accounts.map(account => <article key={account.id} className="px-5 sm:px-6 py-4 border-t border-[var(--line)] flex items-center gap-3">
          <span className="h-10 w-10 rounded-full bg-[#e2eee7] grid place-items-center text-xs font-black shrink-0">{account.full_name.split(" ").map(value => value[0]).slice(0, 2).join("").toUpperCase()}</span>
          <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="font-bold text-sm truncate">{account.full_name}</p><span className={`badge shrink-0 ${account.role === "hc_admin" ? "bg-[#fff4db] text-[#8a6313]" : "bg-[#e5f7ed] text-[#176b49]"}`}>{account.role === "hc_admin" ? "HC Admin" : "Employee"}</span></div><p className="text-xs text-[var(--muted)] truncate mt-1">{account.department || "Tanpa departemen"}{account.email ? ` · ${account.email}` : ""}</p></div>
          {canManage && <div className="flex gap-1 shrink-0"><button type="button" onClick={() => startEdit(account)} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-[#e5f7ed] text-[#196c4a]" aria-label={`Edit ${account.full_name}`}><Pencil size={16} /></button><button type="button" onClick={() => remove(account)} disabled={deletingId === account.id} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50" aria-label={`Hapus ${account.full_name}`}><Trash2 size={16} /></button></div>}
        </article>)}
        {!accounts.length && <p className="px-5 sm:px-6 py-6 border-t border-[var(--line)] text-sm text-[var(--muted)]">Belum ada akun Employee atau HC Admin.</p>}
      </div>
    </div>

    {canManage ? <form ref={formRef} onSubmit={submit} className="panel p-5 sm:p-6 scroll-mt-20" noValidate>
      <div className="flex items-center gap-3 mb-5"><span className="h-10 w-10 rounded-xl bg-[#e5f7ed] text-[#196c4a] grid place-items-center">{editing ? <Pencil size={19} /> : <UserPlus size={19} />}</span><div className="flex-1"><p className="label">Superadmin</p><h2 className="text-lg font-black">{editing ? "Edit akun pengguna" : "Tambah akun pengguna"}</h2></div>{editing && <button type="button" onClick={resetForm} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-gray-100" aria-label="Batal edit"><X size={18} /></button>}</div>
      <div className="space-y-4">
        <div><label htmlFor="employee-role" className="label">Role akun</label><select id="employee-role" className="field mt-2" value={draft.role} onChange={event => change("role", event.target.value)} required><option value="employee">Employee</option><option value="hc_admin">HC Admin</option></select></div>
        <div><label htmlFor="employee-name" className="label">Nama lengkap</label><input id="employee-name" className="field mt-2" value={draft.fullName} onChange={event => change("fullName", event.target.value)} minLength={2} maxLength={100} autoComplete="name" required placeholder="Nama pengguna" /></div>
        <div><label htmlFor="employee-email" className="label">Email login</label><input id="employee-email" className="field mt-2" value={draft.email} onChange={event => change("email", event.target.value)} type="email" maxLength={254} autoComplete="off" required placeholder="nama@perusahaan.com" /></div>
        <div><label htmlFor="employee-department" className="label">Departemen</label><input id="employee-department" className="field mt-2" value={draft.department} onChange={event => change("department", event.target.value)} minLength={2} maxLength={80} required placeholder="Contoh: Finance" /></div>
        <div>
          <div className="flex items-center justify-between gap-3"><label htmlFor="employee-password" className="label">{editing ? "Password baru (opsional)" : "Password sementara"}</label><button type="button" className="text-xs font-bold text-[#196c4a]" onClick={() => change("password", generatePassword())}><KeyRound size={13} className="inline mr-1" />Buat otomatis</button></div>
          <div className="relative mt-2"><input id="employee-password" className="field pr-12" type={showPassword ? "text" : "password"} value={draft.password} onChange={event => change("password", event.target.value)} minLength={8} maxLength={72} pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,72}" title="Gunakan 8–72 karakter yang memuat huruf dan angka" autoComplete="new-password" required={!editing} placeholder={editing ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"} /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute inset-y-0 right-0 w-11 grid place-items-center text-[var(--muted)]" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          <p className="text-xs text-[var(--muted)] mt-2">Gunakan huruf dan angka. Bagikan password baru secara aman kepada pengguna.</p>
        </div>
      </div>

      {createdAccount && <div className="mt-4 rounded-xl bg-[#e5f7ed] p-4 text-sm text-[#176b49]"><p className="font-bold">Simpan kredensial {createdAccount.fullName} sekarang.</p><dl className="mt-2 space-y-1"><div><dt className="inline font-bold">Email: </dt><dd className="inline break-all">{createdAccount.email}</dd></div><div><dt className="inline font-bold">Password: </dt><dd className="inline break-all font-mono">{createdAccount.password}</dd></div></dl><button type="button" onClick={copyCredentials} className="btn btn-secondary mt-3 w-full"><Copy size={15} />Salin email & password</button></div>}
      {message && <p role="status" className={`mt-4 rounded-xl p-3 text-sm ${message.includes("berhasil") || message.includes("disalin") ? "bg-[#e5f7ed] text-[#176b49]" : "bg-red-50 text-red-700"}`}>{message}</p>}
      <button disabled={saving} className="btn btn-primary w-full mt-5 disabled:opacity-50"><Plus size={16} />{saving ? "Menyimpan…" : editing ? "Simpan perubahan" : "Tambah akun"}</button>
    </form> : <div className="panel p-5 text-sm text-[var(--muted)]">Daftar akun dapat dilihat oleh HC Admin. Pembuatan, perubahan role, reset password, dan penghapusan akun hanya tersedia untuk Superadmin.</div>}
  </section>;
}
