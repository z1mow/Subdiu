import { Brand } from "@/components/brand"
import { SidebarNav } from "@/components/layout/sidebar-nav"

/** Kenar çubuğu içeriği — hem masaüstü panelinde hem de mobil Sheet içinde kullanılır. */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 py-5">
      <div className="px-5">
        <Brand />
      </div>
      <SidebarNav onNavigate={onNavigate} />
      <div className="mt-auto px-5">
        <p className="text-xs text-muted-foreground">Subdiu · v0.1</p>
      </div>
    </div>
  )
}
