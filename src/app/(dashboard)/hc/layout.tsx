import { requireRole } from "@/lib/auth";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["hc_admin", "superadmin"]);
  return children;
}
