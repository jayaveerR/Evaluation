import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, GraduationCap, FileText, CheckCircle, TrendingUp, Clock } from 'lucide-react';

const stats = [
  { label: 'Total Students', value: '1,284', icon: GraduationCap, change: '+12%' },
  { label: 'Instructors', value: '48', icon: Users, change: '+3%' },
  { label: 'Total Exams', value: '156', icon: FileText, change: '+8%' },
  { label: 'Evaluated', value: '2,847', icon: CheckCircle, change: '+24%' },
];

const recentEvals = [
  { student: 'Alice Johnson', exam: 'Math Final', score: '87/100', status: 'Completed' },
  { student: 'Bob Smith', exam: 'Physics Mid', score: '72/100', status: 'Completed' },
  { student: 'Carol Davis', exam: 'Chemistry', score: '—', status: 'Pending' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  return (
    <DashboardLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, Admin</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-success">
                  <TrendingUp className="h-3 w-3" />{s.change}
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground font-mono">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Recent evaluations */}
        <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">Recent Evaluations</h2>
            </div>
            <div className="divide-y divide-border">
              {recentEvals.map((e) => (
                <div key={e.student} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.student}</p>
                    <p className="text-xs text-muted-foreground">{e.exam}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-medium text-foreground">{e.score}</p>
                    <p className={`text-xs ${e.status === 'Completed' ? 'text-success' : 'text-warning'}`}>
                      {e.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">Status Summary</h2>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Evaluated', pct: 78, color: 'bg-primary' },
                { label: 'Pending', pct: 15, color: 'bg-warning' },
                { label: 'Failed OCR', pct: 7, color: 'bg-destructive' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-foreground">{s.label}</span>
                    <span className="font-mono text-muted-foreground">{s.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
