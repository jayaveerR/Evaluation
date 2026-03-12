import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Shield, BookOpen, BarChart3, Clock, Loader2, Save } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    rollNumber: ''
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setFormData({
            fullName: data.fullName || '',
            phone: data.phone || '',
            rollNumber: data.rollNumber || ''
          });
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName,
        phone: formData.phone,
        rollNumber: formData.rollNumber
      });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your personal information and account security</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 transition-all group-hover:bg-primary/20">
                <User className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{formData.fullName || 'User'}</p>
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {auth.currentUser?.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 capitalize text-primary" />
                  <span className="capitalize">{userData?.role || 'Member'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">Personal Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName"
                    value={formData.fullName} 
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number / ID</Label>
                  <Input 
                    id="rollNumber"
                    value={formData.rollNumber} 
                    onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                    placeholder="e.g. CS2024001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={auth.currentUser?.email || ''} type="email" readOnly className="bg-secondary/50" />
                <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Account Security */}
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider">Danger Zone</h3>
          <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
          <Button variant="destructive" size="sm">Delete Account</Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

