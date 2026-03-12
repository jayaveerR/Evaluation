import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Play, Loader2, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface EvaluationResult {
  id: string;
  exam: string;
  date: string;
  marks: string;
  pct: string;
  grade: string;
  student?: string; // Optional addition if I want to show roll number
}

export default function AdminAllEvaluations() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: results = [], isLoading, isFetching } = useQuery({
    queryKey: ['evaluations'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/results');
      if (!res.ok) throw new Error('Failed to fetch results');
      return res.json() as Promise<EvaluationResult[]>;
    }
  });

  const mutation = useMutation({
    mutationFn: async () => {
      // Demo trigger for evaluation
      const res = await fetch('http://localhost:5000/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: 'sample_exam', roll_number: 'DEMO001' })
      });
      if (!res.ok) throw new Error('Evaluation failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      toast.success('AI Evaluation completed for DEMO001');
    }
  });

  const filtered = results.filter(r =>
    r.exam?.toLowerCase().includes(search.toLowerCase()) ||
    r.id?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Fetching evaluations...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Evaluations</h1>
            <p className="text-sm text-muted-foreground">Review AI grading results across all exams and students</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['evaluations'] })} disabled={isFetching}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => mutation.mutate()} 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Test Evaluation
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search by exam name or ID..." 
              className="pl-9" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Evaluation ID</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Exam</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Date</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Score</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">%</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Grade</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                      {isFetching ? 'Updating results...' : 'No evaluations found. Start by uploading papers.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">#{r.id.slice(-8)}</td>
                      <td className="px-5 py-4 font-medium text-foreground">{r.exam}</td>
                      <td className="px-5 py-4 text-muted-foreground">{r.date}</td>
                      <td className="px-5 py-4 font-mono text-foreground font-semibold">{r.marks}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: r.pct }}
                            />
                          </div>
                          <span className="font-mono text-xs">{r.pct}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${
                          r.grade === 'A' ? 'bg-success/10 text-success border border-success/20' : 
                          'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                          {r.grade}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link 
                          to={`/evaluation/${r.id}`} 
                          className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
