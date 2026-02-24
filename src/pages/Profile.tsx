import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Shield, BookOpen, BarChart3, Clock } from 'lucide-react';

const stats = [
  { label: 'Exams Taken', value: '12', icon: BookOpen },
  { label: 'Results Published', value: '10', icon: BarChart3 },
  { label: 'Pending', value: '2', icon: Clock },
];

export default function Profile() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account settings</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Alice Johnson</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                alice@university.edu
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Student
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg bg-secondary p-4 text-center">
                <s.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="text-xl font-bold font-mono text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue="Alice Johnson" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="alice@university.edu" type="email" />
            </div>
            <Button>Save Changes</Button>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
