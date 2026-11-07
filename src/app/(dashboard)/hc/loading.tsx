export default function AdminLoading() {
  return <div className="animate-pulse" aria-busy="true" aria-label="Memuat halaman">
    <div className="h-3 w-32 rounded bg-gray-200 mb-3" />
    <div className="h-9 w-72 max-w-full rounded-lg bg-gray-200 mb-8" />
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[1,2,3,4].map(item=><div key={item} className="h-32 panel bg-white/60" />)}</div>
    <div className="h-80 panel bg-white/60 mt-6" />
  </div>;
}
