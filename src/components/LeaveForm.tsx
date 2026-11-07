/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Paperclip, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Coordinates = { latitude: number; longitude: number; accuracy: number };
const typeLabel: Record<string, string> = { sick: "Sakit", leave: "Cuti", permission: "Izin" };

function readCoordinates() {
  return new Promise<Coordinates | null>(resolve => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Foto lampiran tidak dapat diproses."));
    };
    image.src = url;
  });
}

async function addWatermark(file: File, details: {
  employeeName: string;
  leaveType: string;
  timestamp: number;
  coordinates: Coordinates | null;
}) {
  const image = await loadImage(file);
  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Watermark foto tidak dapat dibuat oleh browser.");

  context.drawImage(image, 0, 0, width, height);
  const padding = Math.max(18, Math.round(width * 0.035));
  const fontSize = Math.max(15, Math.min(30, Math.round(width * 0.03)));
  const lineHeight = Math.round(fontSize * 1.35);
  const overlayHeight = padding * 2 + lineHeight * 4;
  const gradient = context.createLinearGradient(0, height - overlayHeight * 1.35, 0, height);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.35, "rgba(0,0,0,.6)");
  gradient.addColorStop(1, "rgba(0,0,0,.88)");
  context.fillStyle = gradient;
  context.fillRect(0, height - overlayHeight * 1.35, width, overlayHeight * 1.35);

  const dateTime = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(new Date(details.timestamp * 1000));
  const gps = details.coordinates
    ? `GPS ${details.coordinates.latitude.toFixed(6)}, ${details.coordinates.longitude.toFixed(6)} · ±${Math.round(details.coordinates.accuracy)} m`
    : "GPS tidak tersedia";
  const lines = [
    `HADIR · BUKTI ${typeLabel[details.leaveType]?.toUpperCase() || "PENGAJUAN"}`,
    details.employeeName,
    `${dateTime} WIB`,
    gps,
  ];

  context.textBaseline = "top";
  lines.forEach((line, index) => {
    context.font = index === 0 ? `800 ${fontSize}px Arial, sans-serif` : `600 ${Math.round(fontSize * .82)}px Arial, sans-serif`;
    context.fillStyle = index === 0 ? "#c8f169" : "#ffffff";
    context.shadowColor = "rgba(0,0,0,.55)";
    context.shadowBlur = 4;
    context.fillText(line, padding, height - overlayHeight + padding + index * lineHeight, width - padding * 2);
  });

  return new Promise<Blob>((resolve, reject) => canvas.toBlob(
    blob => blob ? resolve(blob) : reject(new Error("Foto ber-watermark gagal dibuat.")),
    "image/jpeg",
    .9,
  ));
}

export function LeaveForm({ employeeName }: { employeeName: string }) {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!photo) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  async function uploadAttachment(file: File, leaveType: string) {
    const signResponse = await fetch("/api/cloudinary-sign", { method: "POST" });
    if (!signResponse.ok) throw new Error("Gagal menyiapkan upload lampiran.");
    const sign = await signResponse.json();
    const coordinates = await readCoordinates();
    const watermarked = await addWatermark(file, {
      employeeName,
      leaveType,
      timestamp: Number(sign.timestamp),
      coordinates,
    });
    const body = new FormData();
    body.append("file", watermarked, "bukti-pengajuan-watermark.jpg");
    body.append("api_key", sign.apiKey);
    body.append("timestamp", String(sign.timestamp));
    body.append("signature", sign.signature);
    body.append("folder", sign.folder);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: "POST", body });
    if (!response.ok) throw new Error("Lampiran gagal diunggah.");
    const result = await response.json();
    return String(result.secure_url);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const type = String(data.get("type"));
    const start = String(data.get("start_date"));
    const end = String(data.get("end_date"));
    const reason = String(data.get("reason") || "").trim();

    if (!["sick", "leave", "permission"].includes(type)) {
      setError("Pilih jenis pengajuan.");
      return;
    }
    if (end < start) {
      setError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
      return;
    }
    if (reason.length < 10 || reason.length > 500) {
      setError("Alasan harus berisi 10–500 karakter.");
      return;
    }
    if (!photo?.size) {
      setError("Foto lampiran wajib dipilih.");
      return;
    }
    if (photo.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(photo.type)) {
      setError("Foto harus berformat JPG atau PNG.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi berakhir. Silakan masuk kembali.");
      const attachmentUrl = await uploadAttachment(photo, type);
      const { error: saveError } = await supabase.from("leave_requests").insert({
        user_id: user.id,
        type,
        start_date: start,
        end_date: end,
        reason,
        attachment_url: attachmentUrl,
        status: "pending",
      });
      if (saveError) throw saveError;
      form.reset();
      setPhoto(null);
      setSent(true);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Pengajuan gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  if (sent) return <div className="panel p-8 text-center"><div className="text-4xl">✓</div><h2 className="text-xl font-black mt-3">Pengajuan tersimpan</h2><p className="text-sm text-[var(--muted)] mt-2">HC akan menerima pengajuan beserta foto ber-watermark secara realtime.</p><button onClick={() => setSent(false)} className="btn btn-secondary mt-5">Buat pengajuan lain</button></div>;

  return <form className="panel p-5 sm:p-6 space-y-5" onSubmit={submit} noValidate>
    <div><label htmlFor="leave-type" className="label">Jenis pengajuan</label><select id="leave-type" name="type" className="field mt-2" required><option value="">Pilih jenis</option><option value="sick">Sakit</option><option value="leave">Cuti</option><option value="permission">Izin</option></select></div>
    <div className="grid sm:grid-cols-2 gap-4"><div><label htmlFor="start-date" className="label">Tanggal mulai</label><input id="start-date" name="start_date" className="field mt-2" type="date" required /></div><div><label htmlFor="end-date" className="label">Tanggal selesai</label><input id="end-date" name="end_date" className="field mt-2" type="date" required /></div></div>
    <div><label htmlFor="reason" className="label">Alasan wajib</label><textarea id="reason" name="reason" className="field mt-2 min-h-28" minLength={10} maxLength={500} placeholder="Jelaskan kebutuhan pengajuanmu (10–500 karakter)" required /></div>
    <div>
      <label className="btn btn-secondary w-full"><Paperclip size={16} />{photo ? "Ganti foto" : "Lampirkan foto wajib"}<input name="attachment" type="file" className="hidden" accept="image/jpeg,image/png" required onChange={event => setPhoto(event.target.files?.[0] || null)} /></label>
      <p className="text-xs text-[var(--muted)] mt-2">JPG/PNG maksimal 5 MB. Waktu WIB, nama, dan koordinat GPS akan ditambahkan otomatis pada foto.</p>
      {preview && <div className="mt-3 rounded-xl overflow-hidden border border-[var(--line)] bg-black"><img src={preview} alt="Pratinjau foto lampiran" className="w-full max-h-64 object-contain" /></div>}
      {photo && <p className="text-xs font-bold text-[#196c4a] mt-2 flex items-center gap-1"><Camera size={13} />{photo.name}</p>}
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={saving} className="btn btn-primary w-full disabled:opacity-50"><Send size={16} />{saving ? "Memberi watermark & menyimpan…" : "Kirim pengajuan"}</button>
  </form>;
}
