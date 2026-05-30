import { SidebarNav } from '@/components/feature/pos/organisms'

export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="ml-16 flex-1 overflow-y-auto lg:ml-56">
        {children}
      </main>
    </div>
  )
}
