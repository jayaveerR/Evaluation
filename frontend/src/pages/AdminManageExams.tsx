import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calendar, Clock, FileText, Eye, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

interface Exam {
  id: string;
  title: string;
  subject: string;
  date: string;
  duration: string;
  questions: number;
  status: string;
}

export default function AdminManageExams() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [newExam, setNewExam] = useState({
    title: '',
    subject: '',
    date: '',
    duration: '',
    questions: 10,
    status: 'Upcoming'
  });

  // Real-time synchronization with Firestore "exams" collection
  useEffect(() => {
    const q = query(collection(db, 'exams'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const examsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Exam[];
      setExams(examsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Listen Error:", error);
      toast.error("Failed to load real-time exam data");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.title || !newExam.subject || !newExam.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExam)
      });

      if (!response.ok) throw new Error('Failed to create exam');
      
      toast.success('Exam successfully created and stored in Firestore');
      setIsDialogOpen(false);
      setNewExam({ title: '', subject: '', date: '', duration: '', questions: 10, status: 'Upcoming' });
    } catch (err) {
      toast.error('Error saving exam to backend');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = exams.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.subject?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Syncing with Exam Database...</p>
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
            <h1 className="text-2xl font-bold text-foreground">Manage Exams</h1>
            <p className="text-sm text-muted-foreground">Real-time examination management portal</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Create New Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
                <DialogDescription>
                  This exam will be stored in the Firebase Firestore collection.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Exam Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Unit Test - Calculus" 
                    value={newExam.title} 
                    onChange={e => setNewExam({...newExam, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="e.g. Mathematics" 
                    value={newExam.subject} 
                    onChange={e => setNewExam({...newExam, subject: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={newExam.date} 
                      onChange={e => setNewExam({...newExam, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input 
                      id="duration" 
                      placeholder="e.g. 2h 30m" 
                      value={newExam.duration} 
                      onChange={e => setNewExam({...newExam, duration: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save to Firestore
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search examinations..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/10">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground font-medium">No examinations found in database.</p>
              <p className="text-xs text-muted-foreground mt-1">Start by creating a new exam record.</p>
            </div>
          ) : filtered.map((exam) => (
            <motion.div 
              layout
              key={exam.id} 
              className="group relative rounded-xl border border-border bg-card p-5 space-y-4 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">{exam.title}</h3>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{exam.subject}</p>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter ${
                  exam.status === 'Active' ? 'bg-success/20 text-success' :
                  exam.status === 'Completed' ? 'bg-primary/20 text-primary' :
                  'bg-warning/20 text-warning'
                }`}>
                  {exam.status}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 py-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary/60" />
                  <span>{exam.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary/60" />
                  <span>{exam.duration || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <Button variant="ghost" size="sm" className="w-full text-xs hover:bg-primary/10 hover:text-primary">
                  <Eye className="mr-2 h-3 w-3" />
                  View Model Answers
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
