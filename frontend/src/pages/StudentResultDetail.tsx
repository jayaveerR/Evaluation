import { API_BASE_URL } from '@/lib/api-config';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Clock, FileText, GraduationCap, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function StudentResultDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/evaluations/${id}`);
        if (!response.ok) throw new Error('Evaluation not found');
        const evalData = await response.json();
        setData(evalData);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-muted-foreground">Evaluation not found or access denied.</p>
          <Link to="/my-results">
            <Button variant="outline">Back to Results</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const percentageInt = parseInt(data.percentage || '0');
  const dateStr = data.recorded_at ? new Date(data.recorded_at).toLocaleDateString() : 'Recent';

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/my-results" className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Result Detail</h1>
            <p className="text-sm text-muted-foreground">{data.exam_id} — Detailed breakdown</p>
          </div>
        </div>

        {/* Score hero */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center gap-8">
            <div className="text-center">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" className="stroke-secondary" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" className="stroke-primary" strokeWidth="8" strokeDasharray={`${percentageInt * 2.64} ${100 * 2.64}`} strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <p className="text-2xl font-bold font-mono text-foreground">{data.percentage}</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                <span>Grade: <strong className="text-foreground">{data.grade}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{data.details?.length || 0} Questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{dateStr}</span>
              </div>
            </div>
            <div className="ml-auto">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="mr-2 h-4 w-4" />
                Print PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Question breakdown */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Question-wise Marks</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {['Q#', 'Your Answer', 'Model Answer', 'AI Feedback', 'Marks'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.details && data.details.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-foreground">{row.question_num}</td>
                    <td className="px-5 py-4 text-foreground max-w-[180px] break-words">{row.student_answer}</td>
                    <td className="px-5 py-4 text-muted-foreground max-w-[180px] break-words">{row.instructor_answer}</td>
                    <td className="px-5 py-4 text-muted-foreground max-w-[200px] break-words">{row.evaluation_feedback}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono ${
                        row.semantic_match_percentage >= 90 ? 'bg-success/10 text-success' : 
                        row.semantic_match_percentage >= 60 ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {row.score}
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
