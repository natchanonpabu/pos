'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Package,
  ClipboardList,
  BarChart3,
  Store,
  Users,
  LogOut,
  User,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useTransition } from 'react'
import { signOut } from '@/actions/auth'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const navItems: NavItem[] = [
  { href: '/', label: 'POS Terminal', icon: LayoutGrid, color: 'text-violet-400' },
  { href: '/products', label: 'สินค้า', icon: Package, color: 'text-emerald-400' },
  { href: '/orders', label: 'ออเดอร์', icon: ClipboardList, color: 'text-sky-400' },
  { href: '/reports', label: 'รายงาน', icon: BarChart3, color: 'text-amber-400' },
  { href: '/users', label: 'ผู้ใช้', icon: Users, color: 'text-pink-400' },
]

const roleLabels = {
  admin: 'ผู้ดูแล',
  manager: 'ผู้จัดการ',
  staff: 'พนักงาน',
} as const

export function SidebarNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isPending, startTransition] = useTransition()

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
    })
  }

  const userInitial = user?.fullName.charAt(0).toUpperCase() || 'U'
  const userName = user?.fullName || 'กำลังโหลด...'
  const userRole = user?.role ? roleLabels[user.role] : ''

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-full flex-col border-r border-sidebar-border bg-sidebar',
        'w-16 lg:w-56'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border lg:justify-start lg:px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Store className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="hidden text-base font-bold tracking-tight text-sidebar-foreground lg:block">
            Chompoo POS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1.5 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                'min-h-11 justify-center lg:justify-start',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  active
                    ? item.color
                    : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'
                )}
              />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <Separator className="mx-3" />

      {/* User Menu */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            'flex h-auto w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-sidebar-accent',
            'min-h-11 justify-center lg:justify-start'
          )}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-violet-400 to-indigo-600 text-xs font-bold text-white">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="hidden min-w-0 flex-1 text-left lg:block">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {userName}
              </p>
              <p className="text-xs text-sidebar-foreground/60">{userRole}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            className="w-56"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                โปรไฟล์
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                ตั้งค่า
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-900/20"
                onClick={handleSignOut}
                disabled={isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isPending ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
