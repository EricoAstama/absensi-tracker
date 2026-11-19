export async function fetchAll<T>(loadPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const rows: T[] = [];
  const size = 500;
  for (let from = 0; ; from += size) {
    const { data, error } = await loadPage(from, from + size - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data || []));
    if (!data || data.length < size) return rows;
  }
}
