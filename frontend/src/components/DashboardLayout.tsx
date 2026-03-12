import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, LayoutDashboard, Upload, FileCheck, BarChart3, Users, BookOpen, FileText, ClipboardList, GraduationCap, User, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const adminLinks = [
  { to: '/manage-users', icon: Users, label: 'Manage Users' },
  { to: '/instructor-students', icon: GraduationCap, label: 'Students List' },
  { to: '/manage-exams', icon: FileText, label: 'Manage Exams' },
  { to: '/manage-subjects', icon: BookOpen, label: 'Manage Subjects' },
  { to: '/model-answers', icon: ClipboardList, label: 'Model Answers' },
  { to: '/upload', icon: Upload, label: 'Upload Papers' },
  { to: '/all-evaluations', icon: ClipboardList, label: 'All Evaluations' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/profile', icon: User, label: 'Profile Settings' },
];

const instructorLinks = [
  { to: '/instructor-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/instructor-students', icon: GraduationCap, label: 'Students List' },
  { to: '/manage-exams', icon: FileText, label: 'Manage Exams' },
  { to: '/manage-subjects', icon: BookOpen, label: 'Manage Subjects' },
  { to: '/model-answers', icon: ClipboardList, label: 'Model Answers' },
  { to: '/upload', icon: Upload, label: 'Upload Papers' },
  { to: '/profile', icon: User, label: 'Profile Settings' },
];

const studentLinks = [
  { to: '/student-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/my-results', icon: BarChart3, label: 'My Results' },
  { to: '/student-profile', icon: User, label: 'My Profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role || 'student');
          }
        } catch (err) {
          console.error("Error fetching role:", err);
        }
        setLoading(false);
      } else {
        navigate('/signin');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  let links = studentLinks;
  let welcomeLabel = "Student";
  
  if (role === 'instructor') {
    links = instructorLinks;
    welcomeLabel = "Instructor";
  } else if (role === 'admin') {
    links = adminLinks;
    welcomeLabel = "Admin";
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">EvalAI</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-4 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            {welcomeLabel} PORTAL
          </p>
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <link.icon className={`h-4 w-4 ${active ? 'text-primary' : ''}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">EvalAI</span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pl-3 transition-colors hover:bg-secondary">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-foreground leading-none">{user?.profile?.name || 'User'}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 capitalize">{role || 'Member'}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(role === 'student' ? '/student-profile' : '/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(role === 'student' ? '/student-dashboard' : role === 'instructor' ? '/instructor-dashboard' : '/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

