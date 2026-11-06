import { EmployeeManager } from "@/components/EmployeeManager";
import { LocationManager } from "@/components/LocationManager";
import { Shell } from "@/components/Shell";
import { Topbar } from "@/components/Topbar";
import { getSessionProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Settings(){
  const session=await getSessionProfile();const supabase=await createServerSupabaseClient();
  const[{data:locations},{data:employees}]=await Promise.all([
    supabase.from("company_locations").select("id,name,latitude,longitude,radius_meters,is_active").order("name"),
    supabase.from("profiles").select("id,full_name,department,created_at").eq("role","employee").order("full_name"),
  ]);
  const canManage=session?.profile.role==="superadmin";
  return <Shell role="admin"><Topbar eyebrow="Konfigurasi" title="Lokasi & employee"/><div className="grid xl:grid-cols-[1.15fr_.85fr] gap-5 items-start"><LocationManager locations={locations||[]} canManage={canManage}/><EmployeeManager employees={employees||[]} canManage={canManage}/></div></Shell>
}
