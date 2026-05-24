import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Receipt, Users, Settings, LogOut, Menu, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices',  icon: FileText,        label: 'Invoices'  },
  { to: '/receipts',  icon: Receipt,         label: 'Receipts'  },
  { to: '/clients',   icon: Users,           label: 'Clients'   },
  { to: '/settings',  icon: Settings,        label: 'Settings'  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  const NavLinks = ({ onItemClick }) => (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onItemClick}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 8,
              fontSize: 14, fontWeight: 600,
              textDecoration: 'none', marginBottom: 4,
              background: isActive ? '#EDE9FE' : 'transparent',
              color: isActive ? '#6D28D9' : '#5C6070',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '12px', borderTop: '1px solid #E8E4F0' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 8,
            fontSize: 14, fontWeight: 600,
            color: '#5C6070', background: 'none',
            border: 'none', cursor: 'pointer', width: '100%',
          }}
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        .billit-desktop-sidebar { display: none; }
        .billit-mobile-topbar { display: flex; }
        .billit-mobile-drawer { display: none; }

        @media (min-width: 768px) {
          .billit-desktop-sidebar { display: flex !important; }
          .billit-mobile-topbar { display: none !important; }
        }
      `}</style>

      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="billit-desktop-sidebar" style={{
        position: 'fixed', top: 0, left: 0,
        height: '100vh', width: 224,
        background: 'white',
        borderRight: '1px solid #E8E4F0',
        flexDirection: 'column',
        zIndex: 10,
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8E4F0' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 900, color: '#0F1117', margin: 0 }}>
            Bill<span style={{ color: '#6D28D9' }}>it</span>
          </h1>
        </div>
        <NavLinks />
      </aside>

      {/* ── Mobile top bar ──────────────────────────────── */}
      <div className="billit-mobile-topbar" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 40, background: 'white',
        borderBottom: '1px solid #E8E4F0',
        padding: '12px 16px',
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 900, color: '#0F1117', margin: 0 }}>
          Bill<span style={{ color: '#6D28D9' }}>it</span>
        </h1>
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            padding: 8, borderRadius: 8,
            border: '1px solid #E8E4F0',
            background: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}
        >
          <Menu size={18} color="#0F1117" />
        </button>
      </div>

      {/* ── Mobile drawer ───────────────────────────────── */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div style={{
            position: 'absolute', top: 0, left: 0,
            height: '100%', width: 260,
            background: 'white',
            boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E8E4F0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 900, color: '#0F1117', margin: 0 }}>
                Bill<span style={{ color: '#6D28D9' }}>it</span>
              </h1>
              <button
                onClick={() => setMobileOpen(false)}
                style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={18} color="#5C6070" />
              </button>
            </div>
            <NavLinks onItemClick={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}