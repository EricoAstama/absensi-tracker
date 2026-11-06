import { describe, expect, it } from "vitest";
import { hasPermission } from "./rbac";
describe("RBAC", () => {
  it("only superadmin can manage users", () => { expect(hasPermission("superadmin", "user:manage")).toBe(true); expect(hasPermission("hc_admin", "user:manage")).toBe(false); expect(hasPermission("employee", "user:manage")).toBe(false); });
  it("only superadmin can manage locations", () => { expect(hasPermission("superadmin", "location:manage")).toBe(true); expect(hasPermission("hc_admin", "location:manage")).toBe(false); expect(hasPermission("employee", "location:manage")).toBe(false); });
  it("staff can export reports while employees cannot", () => { expect(hasPermission("superadmin", "report:export")).toBe(true); expect(hasPermission("hc_admin", "report:export")).toBe(true); expect(hasPermission("employee", "report:export")).toBe(false); });
});
