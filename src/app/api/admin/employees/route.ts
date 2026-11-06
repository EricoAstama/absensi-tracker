import { NextResponse } from "next/server";
import type { EmployeeInput } from "@/lib/employee-input";
import { validateEmployeeInput } from "@/lib/employee-input";
import { getSessionProfile } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const session = await getSessionProfile();
  if (!session) return NextResponse.json({ message: "Sesi login tidak ditemukan." }, { status: 401 });
  if (!hasPermission(session.profile.role, "user:manage")) {
    return NextResponse.json({ message: "Hanya Superadmin yang dapat menambahkan employee." }, { status: 403 });
  }

  let body: EmployeeInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Data employee tidak dapat dibaca." }, { status: 400 });
  }

  const validated = validateEmployeeInput(body, true);
  if ("error" in validated) return NextResponse.json({ message: validated.error }, { status: 422 });

  try {
    const admin = createAdminSupabaseClient();
    const { fullName, email, password, department } = validated.data;
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, department },
    });

    if (authError) {
      const duplicate = /already|registered|exists/i.test(authError.message);
      return NextResponse.json(
        { message: duplicate ? "Email tersebut sudah digunakan oleh akun lain." : "Akun employee gagal dibuat." },
        { status: duplicate ? 409 : 400 },
      );
    }
    if (!authData.user) return NextResponse.json({ message: "Akun employee gagal dibuat." }, { status: 500 });

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .insert({
        id: authData.user.id,
        full_name: fullName,
        role: "employee",
        department,
        updated_at: new Date().toISOString(),
      })
      .select("id,full_name,department,created_at")
      .single();

    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ message: "Profil employee gagal disimpan. Akun dibatalkan." }, { status: 500 });
    }

    return NextResponse.json({ employee: profile }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Layanan pembuatan akun belum siap. Periksa SUPABASE_SERVICE_ROLE_KEY pada environment deployment." },
      { status: 503 },
    );
  }
}
