'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { User, Lock, Mail } from 'lucide-react';


interface SignupViewProps {
  onSwitchToLogin: () => void;
}

const signupSchema = z.object({
  displayName: z.string().min(3, 'Display name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupView({ onSwitchToLogin }: SignupViewProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: data.displayName });

      const userDocRef = doc(firestore, 'users', user.uid);
      setDocumentNonBlocking(userDocRef, {
        displayName: data.displayName
      }, { merge: true });

      toast({
        title: 'Account Created!',
        description: 'You have been successfully signed up.',
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-500">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-2xl shadow-2xl transform transition-all hover:scale-[1.01]">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800">
                Create Account
            </h1>
            <p className="text-sm text-slate-500 mt-2">
                Already registered?{' '}
                <Button variant="link" onClick={onSwitchToLogin} className="p-0 text-blue-600">
                    Click here to sign in
                </Button>
            </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input placeholder="Display Name" {...field} className="pl-10 h-12 rounded-full bg-slate-100 border-transparent focus:bg-white focus:border-blue-500" />
                    </div>
                  </FormControl>
                  <FormMessage className="pl-4"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input placeholder="Email" {...field} className="pl-10 h-12 rounded-full bg-slate-100 border-transparent focus:bg-white focus:border-blue-500" />
                    </div>
                  </FormControl>
                  <FormMessage className="pl-4"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input type="password" placeholder="Password" {...field} className="pl-10 h-12 rounded-full bg-slate-100 border-transparent focus:bg-white focus:border-blue-500" />
                    </div>
                  </FormControl>
                  <FormMessage className="pl-4"/>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-12 rounded-full text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
