import { NextResponse } from "next/server";
import type { EmployeeInput } from "@/lib/employee-input";
import { isUuid, validateEmployeeInput } from "@/lib/employee-input";
import { getSessionProfile } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ id: string }> };

async function authorize() {
  const session = await getSessionProfile();
  if (!session) return { response: NextResponse.json({ message: "Sesi login tidak ditemukan." }, { status: 401 }) };
  if (!hasPermission(session.profile.role, "user:manage")) {
    return { response: NextResponse.json({ message: "Hanya Superadmin yang dapat mengelola akun pengguna." }, { status: 403 }) };
  }
  return { admin: createAdminSupabaseClient() };
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  if (!isUuid(id)) return NextResponse.json({ message: "ID pengguna tidak valid." }, { status: 400 });

  let access;
  try {
    access = await authorize();
  } catch {
    return NextResponse.json({ message: "Layanan pengelolaan akun belum siap." }, { status: 503 });
  }
  if ("response" in access) return access.response;

  let body: EmployeeInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Data akun tidak dapat dibaca." }, { status: 400 });
  }
  const validated = validateEmployeeInput(body, false);
  if ("error" in validated) return NextResponse.json({ message: validated.error }, { status: 422 });

  const { admin } = access;
  const { data: currentProfile, error: profileLookupError } = await admin
    .from("profiles")
    .select("id,full_name,department,role")
    .eq("id", id)
    .in("role", ["employee", "hc_admin"])
    .maybeSingle();
  if (profileLookupError) return NextResponse.json({ message: "Data pengguna gagal dibaca." }, { status: 500 });
  if (!currentProfile) return NextResponse.json({ message: "Akun pengguna tidak ditemukan." }, { status: 404 });

  const { data: userData, error: userLookupError } = await admin.auth.admin.getUserById(id);
  if (userLookupError || !userData.user) return NextResponse.json({ message: "Akun login pengguna tidak ditemukan." }, { status: 404 });

  const { fullName, email, password, department, role } = validated.data;
  const { error: profileError } = await admin.from("profiles").update({
    full_name: fullName,
    department,
    role,
    updated_at: new Date().toISOString(),
  }).eq("id", id).in("role", ["employee", "hc_admin"]);
  if (profileError) return NextResponse.json({ message: "Profil pengguna gagal diperbarui." }, { status: 500 });

  const authUpdates = {
    email,
    email_confirm: true,
    user_metadata: { ...userData.user.user_metadata, full_name: fullName, department, role },
    ...(password ? { password } : {}),
  };
  const { error: authError } = await admin.auth.admin.updateUserById(id, authUpdates);
  if (authError) {
    await admin.from("profiles").update({
      full_name: currentProfile.full_name,
      department: currentProfile.department,
      role: currentProfile.role,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    const duplicate = /already|registered|exists/i.test(authError.message);
    return NextResponse.json(
      { message: duplicate ? "Email tersebut sudah digunakan oleh akun lain." : "Akun login pengguna gagal diperbarui." },
      { status: duplicate ? 409 : 400 },
    );
  }

  return NextResponse.json({
    account: { id, full_name: fullName, email, department, role },
    message: password ? "Akun dan password berhasil diperbarui." : "Akun pengguna berhasil diperbarui.",
  });
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  if (!isUuid(id)) return NextResponse.json({ message: "ID pengguna tidak valid." }, { status: 400 });

  let access;
  try {
    access = await authorize();
  } catch {
    return NextResponse.json({ message: "Layanan pengelolaan akun belum siap." }, { status: 503 });
  }
  if ("response" in access) return access.response;

  const { admin } = access;
  const { data: account, error: lookupError } = await admin
    .from("profiles")
    .select("id,role")
    .eq("id", id)
    .in("role", ["employee", "hc_admin"])
    .maybeSingle();
  if (lookupError) return NextResponse.json({ message: "Data pengguna gagal dibaca." }, { status: 500 });
  if (!account) return NextResponse.json({ message: "Akun pengguna tidak ditemukan." }, { status: 404 });

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ message: "Akun pengguna gagal dihapus." }, { status: 400 });
  return NextResponse.json({ message: "Akun pengguna dan seluruh data terkait berhasil dihapus." });
}
