import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Trophy, BarChart3, Award } from 'lucide-react';

const stats = [
  { label: 'Total Exams', value: '12', icon: BarChart3 },
  { label: 'Avg Score', value: '78%', icon: Trophy },
  { label: 'Best Score', value: '95%', icon: Award },
];

const results = [
  { exam: 'Mathematics Final', date: '2026-02-15', marks: '87/100', pct: '87%', grade: 'A' },
  { exam: 'Physics Midterm', date: '2026-02-10', marks: '72/100', pct: '72%', grade: 'B' },
  { exam: 'Chemistry Quiz', date: '2026-01-28', marks: '95/100', pct: '95%', grade: 'A+' },
  { exam: 'English Essay', date: '2026-01-20', marks: '68/100', pct: '68%', grade: 'B-' },
];

export default function StudentResults() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Results</h1>
          <p className="text-sm text-muted-foreground">View your exam performance</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Results Table</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {['Exam', 'Date', 'Marks', '%', 'Grade'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((r) => (
                  <tr key={r.exam} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">{r.exam}</td>
                    <td className="px-5 py-3.5 font-mono text-muted-foreground">{r.date}</td>
                    <td className="px-5 py-3.5 font-mono text-foreground">{r.marks}</td>
                    <td className="px-5 py-3.5 font-mono text-foreground">{r.pct}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        r.grade.startsWith('A') ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
