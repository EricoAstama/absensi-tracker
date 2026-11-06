export type EmployeeInput = {
  fullName?: unknown;
  email?: unknown;
  password?: unknown;
  department?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateEmployeeInput(input: EmployeeInput, passwordRequired: boolean) {
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
  if (passwordRequired && !password) {
    return { error: "Password sementara wajib diisi." } as const;
  }
  if (password && (password.length < 8 || password.length > 72 || !/[A-Za-z]/.test(password) || !/\d/.test(password))) {
    return { error: "Password harus 8–72 karakter serta memuat huruf dan angka." } as const;
  }

  return { data: { fullName, email, password, department } } as const;
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
