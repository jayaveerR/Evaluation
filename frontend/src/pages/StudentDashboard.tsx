import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GraduationCap, BarChart3, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Student');
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: 'Total Exams', value: '0', icon: GraduationCap },
    { label: 'Results Out', value: '0', icon: BarChart3 },
    { label: 'Pending', value: '0', icon: Clock },
    { label: 'Avg Score', value: '0%', icon: TrendingUp },
  ]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || 'Student');
        
        // Setup real-time listener for student evaluations
        const q = query(
          collection(db, "evaluations"), 
          where("roll_number", "==", user.uid)
        );

        const unsubscribeResults = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setResultsData(data);

          // Calculate Real-time Stats
          const totalExams = data.length;
          const evaluated = data.length; // Since they are in evaluations, they are evaluated
          const pending = 0;
          const scores = data.map((r: any) => ((r.total_score || 0) / (r.max_score || 100)) * 100);
          const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

          setStats([
            { label: 'Total Exams', value: String(totalExams), icon: GraduationCap },
            { label: 'Results Out', value: String(evaluated), icon: BarChart3 },
            { label: 'Pending', value: String(pending), icon: Clock },
            { label: 'Avg Score', value: `${avgScore}%`, icon: TrendingUp },
          ]);
          
          setLoading(false);
        });

        return () => unsubscribeResults();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
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

  const performancePct = parseInt(stats[3].value);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* My Results */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">Live Results</h2>
            </div>
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {resultsData.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground text-sm">
                  No exam results found yet.
                </div>
              ) : (
                resultsData.map((r) => (
                  <div key={r.id} className="px-5 py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-foreground">{r.exam_name || 'Exam Result'}</p>
                      <p className="text-sm font-mono font-black text-primary">{r.total_score || 0}/{r.max_score || 0}</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div 
                        className="h-full rounded-full bg-primary transition-all duration-1000" 
                        style={{ width: `${((r.total_score || 0) / (r.max_score || 1)) * 100}%` }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">Performance Overview</h2>
            </div>
            <div className="p-5 flex flex-col items-center gap-6">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" className="stroke-secondary" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="42" fill="none" 
                    className="stroke-primary transition-all duration-1000" 
                    strokeWidth="8" 
                    strokeDasharray={`${performancePct * 2.64} 264`} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-3xl font-bold font-mono text-foreground">{performancePct}%</p>
                </div>
              </div>
              <div className="grid w-full grid-cols-3 gap-3">
                {[
                  { label: 'Total', value: stats[0].value },
                  { label: 'Graded', value: stats[1].value },
                  { label: 'Ready', value: stats[2].value === '0' ? 'Done' : stats[2].value },
                ].map((p) => (
                  <div key={p.label} className="rounded-lg bg-secondary p-3 text-center">
                    <p className="text-xs text-muted-foreground">{p.label}</p>
                    <p className="text-lg font-bold font-mono text-foreground">{p.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
