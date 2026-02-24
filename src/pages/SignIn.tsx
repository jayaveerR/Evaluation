import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignIn() {
  const [showPw, setShowPw] = useState(false);

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

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} placeholder="••••••••" />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full" size="lg">Sign In</Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">or</span></div>
          </div>

          <Button variant="outline" className="w-full" size="lg">Continue with Google</Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">Register</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
