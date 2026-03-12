import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { User, Mail, Shield, Hash, Calendar, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const info = [
    { label: 'Full Name', value: user?.profile?.name || 'User', icon: User },
    { label: 'Email', value: user?.email, icon: Mail },
    { label: 'Verified Status', value: user?.emailVerified ? 'Verified' : 'Pending Verification', icon: Shield },
    { label: 'Joined Date', value: new Date(user?.createdAt).toLocaleDateString(), icon: Calendar },
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Profile</h1>
          <p className="text-sm text-muted-foreground">Your account information</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          {/* Avatar section */}
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{user?.profile?.name || 'User'}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Student
              </div>
            </div>
          </div>

          {/* Account info */}
          <div>
            <h2 className="font-semibold text-foreground mb-4">Account Info</h2>
            <div className="space-y-3">
              {info.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-lg bg-secondary p-3.5">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

