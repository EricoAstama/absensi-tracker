import { LeaveForm } from "@/components/LeaveForm";
import { RealtimeRefresh } from "@/components/RealtimeRefresh";
import { Shell } from "@/components/Shell";
import { Topbar } from "@/components/Topbar";
import { getSessionProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const typeLabel:Record<string,string>={sick:"Sakit",leave:"Cuti",permission:"Izin"};
const statusLabel:Record<string,string>={pending:"Menunggu",approved:"Disetujui",rejected:"Ditolak"};
const statusClass:Record<string,string>={pending:"bg-[#fff4db] text-[#8a6313]",approved:"bg-[#e5f7ed] text-[#176b49]",rejected:"bg-red-50 text-red-700"};

export default async function Leave(){const session=await getSessionProfile();const supabase=await createServerSupabaseClient();const{data:requests}=session?await supabase.from("leave_requests").select("id,type,start_date,end_date,reason,status,rejection_note,created_at").eq("user_id",session.user.id).order("created_at",{ascending:false}).limit(8):{data:[]};return <Shell><RealtimeRefresh tables={["leave_requests"]}/><Topbar eyebrow="Izin & cuti" title="Ajukan ketidakhadiran"/><div className="grid lg:grid-cols-[1.2fr_.8fr] gap-5"><LeaveForm/><aside className="panel p-5 h-fit"><p className="label">Riwayat pengajuan</p><div className="mt-4 space-y-3">{requests?.length?requests.map(request=><article key={request.id} className="rounded-xl border border-[var(--line)] p-3"><div className="flex items-start justify-between gap-2"><div><p className="font-bold text-sm">{typeLabel[request.type]||request.type}</p><p className="text-xs text-[var(--muted)] mt-1">{request.start_date}{request.end_date!==request.start_date?` – ${request.end_date}`:""}</p></div><span className={`badge ${statusClass[request.status||"pending"]}`}>{statusLabel[request.status||"pending"]}</span></div><p className="text-xs mt-2 line-clamp-2">{request.reason}</p>{request.rejection_note&&<p className="text-xs text-red-700 mt-2">Catatan: {request.rejection_note}</p>}</article>):<p className="text-sm text-[var(--muted)]">Belum ada pengajuan.</p>}</div></aside></div></Shell>}
