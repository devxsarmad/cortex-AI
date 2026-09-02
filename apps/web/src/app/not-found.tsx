export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f7] px-4 text-ink">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold tracking-normal text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The Cortex AI page you requested does not exist.
        </p>
      </div>
    </main>
  );
}
