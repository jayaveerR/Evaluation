import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Loader2, Save, BookOpen } from 'lucide-react';
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

interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
}

export default function AdminManageSubjects() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [newSubject, setNewSubject] = useState({
    code: '',
    name: '',
    description: ''
  });

  // Real-time synchronization with Firestore "subjects" collection
  useEffect(() => {
    const q = query(collection(db, 'subjects'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subjectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subject[];
      setSubjects(subjectsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Listen Error:", error);
      toast.error("Failed to sync subject data");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.code || !newSubject.name) {
      toast.error('Subject code and name are required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubject)
      });

      if (!response.ok) throw new Error('Failed to create subject');
      
      toast.success('Subject added and synced to Firestore');
      setIsDialogOpen(false);
      setNewSubject({ code: '', name: '', description: '' });
    } catch (err) {
      toast.error('Error saving subject to database');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = subjects.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground font-medium">Connecting to Subjects Collection...</p>
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
            <h1 className="text-2xl font-bold text-foreground">Manage Subjects</h1>
            <p className="text-sm text-muted-foreground">Department-wide academic subject directory</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                Add New Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Subject to Firestore</DialogTitle>
                <DialogDescription>
                  Adding a subject here will trigger real-time updates for all instructors.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Subject Code</Label>
                  <Input 
                    id="code" 
                    placeholder="e.g. PHY-201" 
                    value={newSubject.code} 
                    onChange={e => setNewSubject({...newSubject, code: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Subject Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Quantum Mechanics" 
                    value={newSubject.name} 
                    onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Brief Description</Label>
                  <Input 
                    id="description" 
                    placeholder="Optional details about the syllabus" 
                    value={newSubject.description} 
                    onChange={e => setNewSubject({...newSubject, description: e.target.value})}
                  />
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Confirm & Store
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search subject code or name..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground">Subject Code</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground">Full Name</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground">Description</th>
                  <th className="px-6 py-4 text-right font-bold text-muted-foreground">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-30">
                        <BookOpen className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground font-medium">Database is empty.</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-secondary/20 transition-all group">
                    <td className="px-6 py-4 font-mono font-bold text-primary text-base">{s.code}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">{s.name}</td>
                    <td className="px-6 py-4 text-muted-foreground max-w-xs truncate italic text-xs">{s.description || 'No description provided.'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
