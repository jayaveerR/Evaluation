import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Search, Copy, Check, Loader2, Mail, Hash } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function InstructorStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/students/list');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        
        // Map backend fullName to displayName if it exists
        const mapped = data.map((s: any) => ({
          ...s,
          displayName: s.fullName || s.name || s.email?.split('@')[0] || 'Unknown Student'
        }));

        setStudents(mapped);
      } catch (err) {
        console.error("Error fetching students:", err);
        toast.error("Could not sync student list from secure server.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('UUID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStudents = students.filter(s => 
    s.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Directory</h1>
            <p className="text-sm text-muted-foreground">Manage and access student unique identifiers for evaluation</p>
          </div>
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email or UUID..." 
              className="pl-9 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-card rounded-2xl border-2 border-dashed border-border">
              <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground font-medium">No students found matching your search.</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <motion.div 
                layout
                key={student.id} 
                className="group relative rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-black text-lg">
                      {student.displayName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground leading-none">{student.displayName}</h3>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {student.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-secondary/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unique ID / UUID</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-[10px] font-bold hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleCopy(student.id)}
                    >
                      {copiedId === student.id ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          COPIED
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" />
                          COPY
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="font-mono text-[11px] font-bold text-primary break-all bg-background/50 p-2 rounded-lg border border-primary/10 select-all">
                    {student.id}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
