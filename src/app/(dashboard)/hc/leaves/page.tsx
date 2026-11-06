import { AdminLeaveList, type AdminLeaveItem } from "@/components/AdminLeaveList";
import { RealtimeRefresh } from "@/components/RealtimeRefresh";
import { Shell } from "@/components/Shell";
import { Topbar } from "@/components/Topbar";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Leaves(){const supabase=await createServerSupabaseClient();const{data,error}=await supabase.from("leave_requests").select("id,type,start_date,end_date,reason,status,attachment_url,rejection_note,created_at,profile:profiles!leave_requests_user_id_fkey(full_name,department)").order("created_at",{ascending:false}).limit(100);const items=(data||[]).map(item=>({...item,profile:Array.isArray(item.profile)?item.profile[0]||null:item.profile})) as AdminLeaveItem[];return <Shell role="admin"><RealtimeRefresh tables={["leave_requests"]}/><Topbar eyebrow="Persetujuan" title="Izin & cuti"/>{error?<p className="rounded-xl bg-red-50 text-red-700 p-4">Data pengajuan gagal dimuat: {error.message}</p>:<AdminLeaveList items={items}/>}</Shell>}
