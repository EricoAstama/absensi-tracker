import { Users } from "lucide-react";
import { LocationManager } from "@/components/LocationManager";
import { Shell } from "@/components/Shell";
import { Topbar } from "@/components/Topbar";
import { getSessionProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Settings(){
  const session=await getSessionProfile();const supabase=await createServerSupabaseClient();
  const{data:locations}=await supabase.from("company_locations").select("id,name,latitude,longitude,radius_meters,is_active").order("name");
  return <Shell role="admin"><Topbar eyebrow="Konfigurasi" title="Lokasi & pekerja"/><div className="grid xl:grid-cols-[1.35fr_.65fr] gap-5"><LocationManager locations={locations||[]} canManage={session?.profile.role==="superadmin"}/><section className="panel p-5 sm:p-6 h-fit"><div className="flex justify-between"><div><p className="label">Master data</p><h2 className="font-black text-xl mt-1">Pekerja</h2></div><Users className="text-[#196c4a]"/></div><p className="text-sm text-[var(--muted)] mt-4">Pengelolaan akun hanya tersedia untuk Superadmin. Role database mencegah HC Admin menaikkan hak akses pengguna.</p></section></div></Shell>
}
