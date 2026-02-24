import { Link, useLocation } from 'react-router-dom';
import { Brain, LayoutDashboard, Upload, FileCheck, BarChart3, Users, Settings, LogOut } from 'lucide-react';

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload', icon: Upload, label: 'Upload Papers' },
  { to: '/evaluations', icon: FileCheck, label: 'Evaluations' },
  { to: '/results', icon: BarChart3, label: 'Reports' },
  { to: '/profile', icon: Users, label: 'Profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Brain className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">EvalAI</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {adminLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">EvalAI</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            {adminLinks.slice(0, 4).map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-lg p-2 transition-colors ${
                    active ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 overflow-auto bg-background p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
