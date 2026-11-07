import { requireRole } from "@/lib/auth";
import { Shell } from "@/components/Shell";
export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["employee"]);
  return <Shell>{children}</Shell>;
}
