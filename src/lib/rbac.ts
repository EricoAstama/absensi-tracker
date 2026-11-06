export type AppRole = "employee" | "hc_admin" | "superadmin";
export type Permission = "attendance:self" | "leave:self" | "profile:self" | "attendance:all" | "leave:manage" | "location:manage" | "report:export" | "user:manage";
const permissions: Record<AppRole, readonly Permission[]> = {
  employee: ["attendance:self", "leave:self", "profile:self"],
  hc_admin: ["attendance:all", "leave:manage", "report:export"],
  superadmin: ["attendance:all", "leave:manage", "location:manage", "report:export", "user:manage"],
};
export function hasPermission(role: AppRole, permission: Permission) { return permissions[role].includes(permission); }
