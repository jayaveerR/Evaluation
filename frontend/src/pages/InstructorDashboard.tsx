import { API_BASE_URL } from '@/lib/api-config';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { BookOpen, Users, FileText, CheckCircle, Loader2, ArrowRight, Upload as UploadIcon, ClipboardList } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, limit, orderBy, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function InstructorDashboard() {
  const [stats, setStats] = useState([
    { label: 'My Subjects', value: '0', icon: BookOpen },
    { label: 'Total Students', value: '0', icon: Users },
    { label: 'Total Exams', value: '0', icon: FileText },
    { label: 'Evaluated', value: '0', icon: CheckCircle },
  ]);
  const [recentEvals, setRecentEvals] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snap) => {
      setStats(prev => [
        { ...prev[0], value: snap.size.toString() },
        prev[1], prev[2], prev[3]
      ]);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const students = snap.docs.filter(d => (d.data().role || 'student').toLowerCase() === 'student').length;
      setStats(prev => [
        prev[0],
        { ...prev[1], value: students.toString() },
        prev[2], prev[3]
      ]);
    });

    const unsubExams = onSnapshot(collection(db, 'exams'), (snap) => {
      setStats(prev => [
        prev[0], prev[1],
        { ...prev[2], value: snap.size.toString() },
        prev[3]
      ]);
    });

    const unsubEvals = onSnapshot(collection(db, 'evaluations'), (snap) => {
      setStats(prev => [
        prev[0], prev[1], prev[2],
        { ...prev[3], value: snap.size.toString() }
      ]);
    });

    const qRecent = query(collection(db, 'evaluations'), orderBy('timestamp', 'desc'), limit(5));
    const unsubRecent = onSnapshot(qRecent, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        title: `${doc.data().exam_id} - ${doc.data().student_roll}`,
        time: doc.data().timestamp ? new Date(doc.data().timestamp.seconds * 1000).toLocaleTimeString() : 'Recently',
        status: doc.data().status === 'success' ? 'Completed' : 'Pending'
      }));
      setRecentEvals(data);
      setLoading(false);
    });

    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/students/list`);
        if (response.ok) {
          const data = await response.json();
          setStudentsList(data.map((s: any) => ({
            id: s.id,
            name: s.fullName || s.email?.split('@')[0] || 'Student',
            email: s.email
          })));
        }
      } catch (err) {
        console.error("Dashboard student list error:", err);
      }
    };

    fetchStudents();

    return () => {
      unsubSubjects();
      unsubUsers();
      unsubExams();
      unsubEvals();
      unsubRecent();
    };
  }, []);

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
          <h1 className="text-2xl font-bold text-foreground">Instructor Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your assigned subjects and student evaluations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors cursor-default">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-4 flex justify-between items-center bg-secondary/20">
              <h2 className="font-semibold text-foreground">Recent Evaluations</h2>
              <Link to="/all-evaluations" className="text-xs text-primary hover:underline flex items-center">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentEvals.length === 0 ? (
                <p className="px-5 py-10 text-center text-muted-foreground">No recent activity.</p>
              ) : (
                recentEvals.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between px-5 py-4 hover:bg-secondary/10 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">Evaluation • {activity.time}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      activity.status === 'Completed' ? 'bg-success/10 text-success' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link 
                to="/manage-exams" 
                className="flex flex-col items-center justify-center rounded-xl bg-secondary p-6 transition-all hover:bg-primary/10 group"
              >
                <FileText className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">Exams</span>
              </Link>
              <Link 
                to="/model-answers" 
                className="flex flex-col items-center justify-center rounded-xl bg-secondary p-6 transition-all hover:bg-primary/10 group"
              >
                <ClipboardList className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">Answer Keys</span>
              </Link>
              <Link 
                to="/instructor-students" 
                className="flex flex-col items-center justify-center rounded-xl bg-secondary p-6 transition-all hover:bg-primary/10 group"
              >
                <Users className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">Students</span>
              </Link>
              <Link 
                to="/upload" 
                className="flex flex-col items-center justify-center rounded-xl bg-secondary p-6 transition-all hover:bg-primary/10 group"
              >
                <UploadIcon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">Upload Papers</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Student Directory */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="border-b border-border px-6 py-4 bg-secondary/20 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-foreground">Student Directory</h2>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Active Enrolled Students</p>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold leading-none">
              {studentsList.length} Students
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="px-6 py-3 text-left font-bold text-muted-foreground uppercase text-[10px]">Name</th>
                  <th className="px-6 py-3 text-left font-bold text-muted-foreground uppercase text-[10px]">Email</th>
                  <th className="px-6 py-3 text-left font-bold text-muted-foreground uppercase text-[10px] bg-primary/5">UUID / Roll Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {studentsList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground italic">No students registered yet.</td>
                  </tr>
                ) : (
                  studentsList.map((s) => (
                    <tr key={s.id} className="hover:bg-secondary/20 transition-colors group">
                      <td className="px-6 py-4 font-bold text-foreground">{s.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{s.email}</td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-primary bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        {s.id}
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
