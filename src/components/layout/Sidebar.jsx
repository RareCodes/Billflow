import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Receipt, Users, Settings, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/receipts', icon: Receipt, label: 'Receipts' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-white border-r border-[#E4E7EE] flex flex-col z-10">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#E4E7EE]">
        <h1 className="text-xl font-bold text-ink" style={{ fontFamily: 'Sora, sans-serif' }}>
          Bill<span style={{ color: '#6D28D9' }}>Flow</span>
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-light text-[#6D28D9]'
                  : 'text-ink-secondary hover:bg-bg hover:text-ink'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#E4E7EE]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-secondary hover:bg-red-50 hover:text-red-500 transition-all w-full"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </aside>
  )
}