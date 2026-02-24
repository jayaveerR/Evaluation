import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload as UploadIcon, FileUp, X } from 'lucide-react';

export default function UploadPapers() {
  const [files, setFiles] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Papers</h1>
          <p className="text-sm text-muted-foreground">Upload answer sheets for AI evaluation</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Exam</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Choose exam" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathematics Final</SelectItem>
                  <SelectItem value="physics">Physics Midterm</SelectItem>
                  <SelectItem value="chemistry">Chemistry Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Student Roll Number</Label>
              <Input placeholder="e.g. CS2024001" />
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const newFiles = Array.from(e.dataTransfer.files).map(f => f.name);
              setFiles(prev => [...prev, ...newFiles]);
            }}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
            }`}
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <FileUp className="h-6 w-6 text-primary" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">Drag & drop files here</p>
            <p className="mb-4 text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
            <Button variant="outline" size="sm" onClick={() => setFiles(prev => [...prev, `paper_${prev.length + 1}.pdf`])}>
              Browse Files
            </Button>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                  <span className="text-sm font-mono text-foreground">{f}</span>
                  <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button className="w-full" size="lg" disabled={files.length === 0}>
            <UploadIcon className="mr-2 h-4 w-4" />
            Upload & Evaluate
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
