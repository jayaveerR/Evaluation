import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trophy, BarChart3, Award, Search, Eye, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export default function StudentMyResults() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/students/results/${user.uid}`);
        if (!response.ok) throw new Error('Failed to fetch results');
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load your results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const filtered = results.filter(r =>
    (r.exam_id || '').toLowerCase().includes(search.toLowerCase())
  );

  // Calculate stats from real data
  const totalExams = results.length;
  const avgScore = results.length > 0 
    ? Math.round(results.reduce((acc, curr) => acc + (curr.percentage ? parseInt(curr.percentage) : 0), 0) / results.length)
    : 0;
  const bestScore = results.length > 0
    ? Math.max(...results.map(r => r.percentage ? parseInt(r.percentage) : 0))
    : 0;

  const stats = [
    { label: 'Total Exams', value: totalExams.toString(), icon: BarChart3 },
    { label: 'Avg Score', value: `${avgScore}%`, icon: Trophy },
    { label: 'Best Score', value: `${bestScore}%`, icon: Award },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Results</h1>
          <p className="text-sm text-muted-foreground">View all your exam results</p>
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

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search exam ID..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground bg-secondary/20 rounded-2xl border-2 border-dashed border-border">
              No results found.
            </div>
          ) : (
            filtered.map((r, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{r.exam_id}</p>
                      <p className="text-sm text-muted-foreground">Evaluation · {r.recorded_at ? new Date(r.recorded_at).toLocaleDateString() : 'Recent'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono font-bold text-foreground">{r.score}/{r.total}</p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        (parseInt(r.percentage) >= 80) ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {r.grade}
                      </span>
                    </div>
                    <Link to={`/result-detail/${r.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: r.percentage }} />
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
