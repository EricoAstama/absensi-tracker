"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarCheck, ClipboardList, LayoutDashboard, LogOut, MapPinned, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const employee = [[/employee$/,LayoutDashboard,"Ringkasan","/employee"],[/attendance/,CalendarCheck,"Presensi","/employee/attendance"],[/leave/,ClipboardList,"Izin & cuti","/employee/leave"]] as const;
const admin = [[/hc$/,LayoutDashboard,"Ringkasan","/hc"],[/matrix/,Users,"Matriks","/hc/matrix"],[/leaves/,ClipboardList,"Izin","/hc/leaves"],[/settings/,MapPinned,"Pengaturan","/hc/settings"]] as const;

function LogoutButton({ compact=false }: { compact?: boolean }) {
  const router=useRouter();
  async function logout(){await createClient().auth.signOut();router.replace("/login");router.refresh()}
  return <button onClick={logout} className={compact?"flex flex-col items-center gap-1 text-[10px] font-bold text-white/65":"flex gap-3 text-sm text-white/60 px-3"}><LogOut size={compact?19:16}/>{compact?"Keluar":"Keluar"}</button>;
}

export function Sidebar({role="employee"}:{role?:"employee"|"admin"}) {
  const path=usePathname(),items=role==="admin"?admin:employee;
  return <>
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 bg-[#123c2d] text-white p-5 flex-col">
      <Link href={role==="admin"?"/hc":"/employee"} className="flex items-center gap-3 mb-10"><span className="grid place-items-center h-10 w-10 rounded-xl bg-[var(--lime)] text-[#123c2d] font-black">H</span><div><div className="text-xl font-black">hadir.</div><div className="text-[10px] text-white/50 tracking-widest">WORKFORCE</div></div></Link>
      <nav className="space-y-2">{items.map(([match,Icon,label,href])=><Link key={href} href={href} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold ${match.test(path)?"bg-white text-[#123c2d]":"text-white/70 hover:bg-white/10"}`}><Icon size={18}/>{label}</Link>)}</nav>
      <div className="mt-auto border-t border-white/10 pt-4"><LogoutButton/></div>
    </aside>
    <header className="md:hidden fixed inset-x-0 top-0 z-40 h-16 bg-[#123c2d] text-white px-4 flex items-center justify-between shadow-lg"><Link href={role==="admin"?"/hc":"/employee"} className="flex items-center gap-2 font-black text-xl"><span className="grid place-items-center h-9 w-9 rounded-xl bg-[var(--lime)] text-[#123c2d]">H</span>hadir.</Link><span className="badge bg-white/10 text-white">{role==="admin"?"Admin":"Employee"}</span></header>
    <nav className="md:hidden fixed inset-x-3 bottom-3 z-50 rounded-2xl bg-[#123c2d] text-white px-2 py-2 shadow-2xl flex items-center justify-around" aria-label="Navigasi utama">
      {items.map(([match,Icon,label,href])=><Link key={href} href={href} className={`min-w-14 px-2 py-1.5 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold ${match.test(path)?"bg-white text-[#123c2d]":"text-white/65"}`}><Icon size={19}/>{label}</Link>)}
      <LogoutButton compact/>
    </nav>
  </>;
}
