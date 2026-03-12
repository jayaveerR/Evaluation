import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const questions = [
  { q: 1, answer: 'The derivative of x² is 2x by the power rule...', feedback: 'Correct application of power rule. Full marks.', marks: '10/10' },
  { q: 2, answer: 'Integration by parts: ∫u dv = uv - ∫v du...', feedback: 'Correct formula but missing final substitution step.', marks: '7/10' },
  { q: 3, answer: 'The limit approaches infinity as x→0...', feedback: 'Incorrect. The limit is undefined, not infinity. Review L\'Hôpital\'s rule.', marks: '3/10' },
];

export default function EvalDetails() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Evaluation Details</h1>
            <p className="text-sm text-muted-foreground">Mathematics Final — Question-wise breakdown</p>
          </div>
        </div>

        {/* Student info */}
        <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-card p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Alice Johnson</p>
            <p className="text-sm text-muted-foreground">Roll: CS2024001</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold font-mono text-foreground">20/30</p>
            <p className="text-sm text-muted-foreground">Total Score</p>
          </div>
        </div>

        {/* Q&A breakdown */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Question-wise Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Q#</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Student Answer</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">AI Feedback</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {questions.map((row) => (
                  <tr key={row.q} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-foreground">{row.q}</td>
                    <td className="px-5 py-4 text-foreground max-w-xs">{row.answer}</td>
                    <td className="px-5 py-4 text-muted-foreground max-w-xs">{row.feedback}</td>
                    <td className="px-5 py-4 text-right font-mono font-semibold text-foreground">{row.marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button>Approve & Publish</Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
