import { requireRole } from "@/lib/auth";
import { Shell } from "@/components/Shell";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["hc_admin", "superadmin"]);
  return <Shell role="admin">{children}</Shell>;
}
