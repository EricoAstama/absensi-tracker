import { EmployeeManager } from "@/components/EmployeeManager";
import { LocationManager } from "@/components/LocationManager";
import { Topbar } from "@/components/Topbar";
import { getSessionProfile } from "@/lib/auth";
import { listAuthUserEmails } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Settings(){
  const session=await getSessionProfile();const supabase=await createServerSupabaseClient();
  const[{data:locations},{data:accounts}]=await Promise.all([
    supabase.from("company_locations").select("id,name,latitude,longitude,radius_meters,is_active").order("name"),
    supabase.from("profiles").select("id,full_name,department,role").in("role",["employee","hc_admin"]).order("role").order("full_name"),
  ]);
  const canManage=session?.profile.role==="superadmin";
  let authEmails=new Map<string,string>();
  if(canManage){try{authEmails=await listAuthUserEmails()}catch{/* API form will show a configuration error if admin credentials are unavailable. */}}
  const accountRows=(accounts||[]).flatMap(account=>account.role==="employee"||account.role==="hc_admin"?[{...account,role:account.role,email:authEmails.get(account.id)||""}]:[]);
  return <><Topbar eyebrow="Konfigurasi" title="Lokasi & akun pengguna"/><div className="grid xl:grid-cols-[1.15fr_.85fr] gap-5 items-start"><LocationManager locations={locations||[]} canManage={canManage}/><EmployeeManager accounts={accountRows} canManage={canManage}/></div></>
}
