export default function MdAdminLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
        <p className="mt-4 text-sm text-white/60">Loading admin section…</p>
      </div>
    </div>
  );
}