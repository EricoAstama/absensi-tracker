import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type EmployeeInput = {
  fullName?: unknown;
  email?: unknown;
  password?: unknown;
  department?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateEmployee(input: EmployeeInput) {
  const fullName = text(input.fullName);
  const email = text(input.email).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";
  const department = text(input.department);

  if (fullName.length < 2 || fullName.length > 100) {
    return { error: "Nama lengkap harus terdiri dari 2–100 karakter." } as const;
  }
  if (department.length < 2 || department.length > 80) {
    return { error: "Departemen harus terdiri dari 2–80 karakter." } as const;
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Format email belum valid." } as const;
  }
  if (password.length < 8 || password.length > 72 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return { error: "Password harus 8–72 karakter serta memuat huruf dan angka." } as const;
  }

  return { data: { fullName, email, password, department } } as const;
}

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

  const validated = validateEmployee(body);
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
