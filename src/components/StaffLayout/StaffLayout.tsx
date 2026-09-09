import { cn } from 'cn'
import { Link, Outlet, useLocation } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { useStaffLayout } from './StaffLayout.logic'

const NAV_LINKS = [
  { to: '/staff', label: 'Projects' },
  { to: '/staff/questions', label: 'Question bank' },
  { to: '/staff/questions/import', label: 'Import' },
]

export function StaffLayout() {
  const { staffUser, logout } = useStaffLayout()
  const location = useLocation()

  return (
    <div className="min-h-svh">
      <nav className="flex items-center justify-between gap-2 border-b p-4">
        <div className="flex gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                buttonVariants({
                  variant:
                    location.pathname === link.to ? 'default' : 'outline',
                  size: 'sm',
                }),
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {staffUser && (
            <span className="text-sm text-muted-foreground">
              {staffUser.name}
            </span>
          )}
          <Button type="button" variant="outline" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}
