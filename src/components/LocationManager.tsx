"use client";

import { useRef, useState } from "react";
import { LocateFixed, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Office = { id: string; name: string; latitude: number; longitude: number; radius_meters: number; is_active: boolean | null };
type LocationDraft = { name: string; latitude: string; longitude: string; radius: string; isActive: boolean };

const emptyDraft: LocationDraft = { name: "", latitude: "", longitude: "", radius: "50", isActive: true };

export function LocationManager({ locations, canManage }: { locations: Office[]; canManage: boolean }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Office | null>(null);
  const [draft, setDraft] = useState<LocationDraft>(emptyDraft);

  function change(field: keyof LocationDraft, value: string | boolean) {
    setDraft(current => ({ ...current, [field]: value }));
  }

  function startEdit(location: Office) {
    setEditing(location);
    setDraft({
      name: location.name,
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      radius: String(location.radius_meters),
      isActive: Boolean(location.is_active),
    });
    setMessage("");
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function resetForm() {
    setEditing(null);
    setDraft(emptyDraft);
  }

  function useDeviceLocation() {
    setMessage("");
    if (!navigator.geolocation) {
      setMessage("Perangkat ini tidak mendukung GPS.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        setDraft(current => ({
          ...current,
          latitude: position.coords.latitude.toFixed(7),
          longitude: position.coords.longitude.toFixed(7),
        }));
        setLocating(false);
        setMessage(`Koordinat terisi dari GPS dengan akurasi ±${Math.round(position.coords.accuracy)} meter.`);
      },
      error => {
        setLocating(false);
        setMessage(error.code === 1 ? "Izin lokasi ditolak. Aktifkan lokasi presisi di pengaturan browser." : "Koordinat belum dapat dibaca. Coba lagi di area terbuka.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;

    const name = draft.name.trim();
    const latitude = Number(draft.latitude);
    const longitude = Number(draft.longitude);
    const radius = Number(draft.radius);
    if (name.length < 2 || name.length > 80) {
      setMessage("Nama lokasi harus 2–80 karakter.");
      return;
    }
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      setMessage("Latitude harus berada di antara -90 dan 90.");
      return;
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setMessage("Longitude harus berada di antara -180 dan 180.");
      return;
    }
    if (!Number.isInteger(radius) || radius < 10 || radius > 5000) {
      setMessage("Radius harus bilangan bulat antara 10 dan 5.000 meter.");
      return;
    }

    setSaving(true);
    setMessage("");
    const values = { name, latitude, longitude, radius_meters: radius, is_active: draft.isActive };
    const supabase = createClient();
    const { error } = editing
      ? await supabase.from("company_locations").update(values).eq("id", editing.id)
      : await supabase.from("company_locations").insert(values);
    setSaving(false);

    if (error) {
      setMessage(error.code === "42501" ? "Hanya Superadmin yang dapat mengelola lokasi." : `Lokasi gagal disimpan: ${error.message}`);
      return;
    }
    setMessage(editing ? "Lokasi berhasil diperbarui." : "Lokasi berhasil ditambahkan dan siap digunakan.");
    resetForm();
    router.refresh();
  }

  async function remove(location: Office) {
    if (!window.confirm(`Hapus lokasi ${location.name}? Lokasi tidak dapat dipulihkan setelah dihapus.`)) return;
    setDeletingId(location.id);
    setMessage("");
    const { error } = await createClient().from("company_locations").delete().eq("id", location.id);
    setDeletingId("");
    if (error) {
      setMessage(error.code === "42501" ? "Hanya Superadmin yang dapat menghapus lokasi." : `Lokasi gagal dihapus: ${error.message}`);
      return;
    }
    if (editing?.id === location.id) resetForm();
    setMessage("Lokasi berhasil dihapus.");
    router.refresh();
  }

  return <section className="space-y-4">
    <div className="grid sm:grid-cols-2 gap-3">
      {locations.map(location => <article key={location.id} className="panel p-4">
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-xl bg-[#e5ede7] text-[#196c4a] grid place-items-center shrink-0"><MapPin size={19} /></span>
          <div className="min-w-0 flex-1"><h3 className="font-bold truncate">{location.name}</h3><p className="text-xs text-[var(--muted)] mt-1">{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p><p className="text-xs text-[var(--muted)]">Radius {location.radius_meters} m · {location.is_active ? "Aktif" : "Nonaktif"}</p></div>
          {canManage && <div className="flex gap-1 shrink-0"><button type="button" onClick={() => startEdit(location)} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-[#e5f7ed] text-[#196c4a]" aria-label={`Edit ${location.name}`}><Pencil size={16} /></button><button type="button" onClick={() => remove(location)} disabled={deletingId === location.id} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50" aria-label={`Hapus ${location.name}`}><Trash2 size={16} /></button></div>}
        </div>
      </article>)}
      {!locations.length && <div className="panel p-6 text-sm text-[var(--muted)] sm:col-span-2">Belum ada lokasi kantor.</div>}
    </div>

    {canManage && <form ref={formRef} onSubmit={submit} className="panel p-5 sm:p-6 scroll-mt-20" noValidate>
      <div className="flex items-center gap-3 mb-5"><span className="h-10 w-10 rounded-xl bg-[#e5f7ed] text-[#196c4a] grid place-items-center">{editing ? <Pencil size={19} /> : <Plus size={19} />}</span><div className="flex-1"><p className="label">Superadmin</p><h2 className="text-lg font-black">{editing ? "Edit lokasi kantor" : "Tambah lokasi kantor"}</h2></div>{editing && <button type="button" onClick={resetForm} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-gray-100" aria-label="Batal edit"><X size={18} /></button>}</div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label htmlFor="location-name" className="label">Nama lokasi</label><input id="location-name" className="field mt-2" value={draft.name} onChange={event => change("name", event.target.value)} minLength={2} maxLength={80} required placeholder="Contoh: Kantor Jakarta" /></div>
        <div className="sm:col-span-2"><button type="button" onClick={useDeviceLocation} disabled={locating} className="btn btn-secondary w-full"><LocateFixed size={16} />{locating ? "Membaca GPS…" : "Gunakan lokasi perangkat"}</button></div>
        <div><label htmlFor="latitude" className="label">Latitude</label><input id="latitude" value={draft.latitude} onChange={event => change("latitude", event.target.value)} className="field mt-2" inputMode="decimal" type="number" step="any" min="-90" max="90" required placeholder="-6.175400" /></div>
        <div><label htmlFor="longitude" className="label">Longitude</label><input id="longitude" value={draft.longitude} onChange={event => change("longitude", event.target.value)} className="field mt-2" inputMode="decimal" type="number" step="any" min="-180" max="180" required placeholder="106.827200" /></div>
        <div><label htmlFor="radius" className="label">Radius (meter)</label><input id="radius" value={draft.radius} onChange={event => change("radius", event.target.value)} className="field mt-2" type="number" min="10" max="5000" step="1" required /></div>
        <label className="flex items-center gap-3 self-end h-11"><input type="checkbox" checked={draft.isActive} onChange={event => change("isActive", event.target.checked)} className="h-5 w-5 accent-[#196c4a]" /><span className="text-sm font-bold">Lokasi aktif</span></label>
      </div>
      {message && <p role="status" className={`mt-4 rounded-xl p-3 text-sm ${message.includes("berhasil") || message.includes("akurasi") ? "bg-[#e5f7ed] text-[#176b49]" : "bg-red-50 text-red-700"}`}>{message}</p>}
      <button disabled={saving || locating} className="btn btn-primary w-full sm:w-auto mt-5 disabled:opacity-50"><Plus size={16} />{saving ? "Menyimpan…" : editing ? "Simpan perubahan" : "Tambah lokasi"}</button>
    </form>}
  </section>;
}
