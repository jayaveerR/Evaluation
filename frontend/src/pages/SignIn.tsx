import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function SignIn() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Fetch User Role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const role = userData?.role || 'student';

      console.log('User signed in with role:', role);
      toast.success('Successfully signed in!');
      
      if (role === 'student') {
        navigate('/student-dashboard');
      } else if (role === 'instructor') {
        navigate('/instructor-dashboard');
      } else if (role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/student-dashboard');
      }

    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Case for new users via Google: Check if exists, else create with default role
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let role = 'student';

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          fullName: user.displayName,
          email: user.email,
          role: 'student',
          createdAt: new Date().toISOString()
        });
      } else {
        role = userDoc.data()?.role || 'student';
      }
      
      toast.success('Successfully signed in with Google!');
      if (role === 'student') navigate('/student-dashboard');
      else if (role === 'instructor') navigate('/instructor-dashboard');
      else if (role === 'admin') navigate('/dashboard');
      else navigate('/student-dashboard');
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left branding */}
      <div className="hidden flex-1 flex-col justify-between bg-primary p-12 lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/20">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-primary-foreground">EvalAI</span>
        </div>
        <div>
          <h2 className="mb-6 text-3xl font-bold text-primary-foreground">
            AI-Powered Exam<br />Evaluation Platform
          </h2>
          <div className="space-y-3">
            {['Secure & encrypted', 'Results in minutes', 'AI-powered grading'].map((t) => (
              <div key={t} className="flex items-center gap-3 text-primary-foreground/80">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/50">© 2026 EvalAI</p>
      </div>

      {/* Right form */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">EvalAI</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="mb-8 text-sm text-muted-foreground">Sign in to your account to continue</p>

          <form className="space-y-4" onSubmit={handleSignIn}>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email" 
                placeholder="you@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input 
                  type={showPw ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">or</span></div>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            size="lg" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">Register</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
