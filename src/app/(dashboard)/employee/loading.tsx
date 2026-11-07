export default function EmployeeLoading() {
  return <div className="animate-pulse" aria-busy="true" aria-label="Memuat halaman">
    <div className="h-3 w-28 rounded bg-gray-200 mb-3" />
    <div className="h-9 w-64 max-w-full rounded-lg bg-gray-200 mb-8" />
    <div className="h-44 rounded-[22px] bg-[#e1e9e3]" />
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">{[1,2,3,4].map(item=><div key={item} className="h-36 panel bg-white/60" />)}</div>
  </div>;
}
