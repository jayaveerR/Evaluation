import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import heroImage from '@/assets/hero-illustration.png';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  ScanText, Brain, Users, BarChart3, Clock, Award, Shield, Upload,
  ArrowRight, Check
} from 'lucide-react';

const features = [
  { icon: ScanText, title: 'OCR Scanning', desc: 'Extract handwritten & printed answers automatically' },
  { icon: Brain, title: 'AI Evaluation', desc: 'Intelligent grading with contextual understanding' },
  { icon: Users, title: 'Role Management', desc: 'Admin, instructor, and student access controls' },
  { icon: BarChart3, title: 'Analytics', desc: 'Detailed performance insights and reports' },
  { icon: Clock, title: 'Time Saving', desc: 'Evaluate hundreds of papers in minutes' },
  { icon: Award, title: 'Accurate Scoring', desc: 'Consistent, unbiased evaluation results' },
  { icon: Shield, title: 'Secure', desc: 'End-to-end encryption for all exam data' },
  { icon: Upload, title: 'Bulk Upload', desc: 'Upload multiple papers at once with drag & drop' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Index() {
  const navigate = useNavigate();
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const role = userDoc.data()?.role || 'student';
          
          console.log('Index: Session found with role:', role);
          
          if (role === 'student') navigate('/student-dashboard');
          else if (role === 'instructor') navigate('/instructor-dashboard');
          else if (role === 'admin') navigate('/dashboard');
          else navigate('/student-dashboard');
          
        } catch (err) {
          console.error('Error checking role:', err);
          setSessionLoading(false);
        }
      } else {
        setSessionLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(226_71%_40%/0.08),transparent_70%)]" />
        <div className="container relative mx-auto px-4 py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                AI-Powered Exam Evaluation
              </div>
              <h1 className="mb-6 text-4xl font-extrabold leading-tight text-foreground lg:text-6xl">
                Evaluate Exams{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Intelligently
                </span>
              </h1>
              <p className="mb-8 max-w-lg text-lg text-muted-foreground">
                Upload answer sheets, let AI grade them with precision. Save hours of manual evaluation with OCR scanning and intelligent scoring.
              </p>
              <div className="mb-8 flex flex-wrap gap-4">
                {['Lightning Fast', 'AI Powered', 'Accurate Results'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Check className="h-4 w-4 text-success" />
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/dashboard">View Demo</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-2xl border border-border shadow-xl">
                <img
                  src={heroImage}
                  alt="EvalAI platform illustration"
                  className="w-full"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-xl border border-border bg-card p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <Check className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">2,847 Papers</p>
                    <p className="text-xs text-muted-foreground">Evaluated today</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-card/50 py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
              Everything you need for exam evaluation
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              A comprehensive platform designed to streamline the entire evaluation process from upload to results.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center text-sm text-muted-foreground md:flex-row md:justify-between md:text-left">
          <p>© 2026 EvalAI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
