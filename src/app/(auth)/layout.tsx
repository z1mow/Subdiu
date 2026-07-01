export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden px-4 py-10">
      {/* İnce, dikkat dağıtmayan arka plan ışıması */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-muted)_0%,transparent_70%)]"
      />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
