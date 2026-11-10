import { describe, expect, it } from "vitest";
import { validateEmployeeInput } from "./employee-input";

const validInput = {
  fullName: "Siti Rahma",
  email: "siti@example.com",
  department: "Human Capital",
  password: "Aman12345",
};

describe("managed account input", () => {
  it.each(["employee", "hc_admin"] as const)("accepts the managed role %s", role => {
    const result = validateEmployeeInput({ ...validInput, role }, true);

    expect(result).toEqual({ data: { ...validInput, role } });
  });

  it.each(["superadmin", "", "owner"])("rejects the unmanaged role %s", role => {
    const result = validateEmployeeInput({ ...validInput, role }, true);

    expect(result).toEqual({ error: "Role akun harus Employee atau HC Admin." });
  });

  it("allows an edit without changing the password", () => {
    const result = validateEmployeeInput({ ...validInput, role: "hc_admin", password: "" }, false);

    expect(result).toHaveProperty("data.role", "hc_admin");
  });
});
