'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAuth, useFirestore } from '@/firebase';
import { signInAnonymously, updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';

const loginSchema = z.object({
  displayName: z.string().min(3, 'Name must be at least 3 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginView() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { displayName: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // First, sign out any existing user to ensure a fresh session
      if (auth.currentUser) {
        await auth.signOut();
      }
      
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: data.displayName });
      
      const userDocRef = doc(firestore, 'users', user.uid);
      setDocumentNonBlocking(userDocRef, {
        displayName: data.displayName
      }, { merge: true });

      toast({
        title: 'Welcome!',
        description: `You're signed in as ${data.displayName}.`,
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-sm p-8 space-y-6 bg-card rounded-3xl shadow-2xl transform transition-all hover:scale-[1.01]">
        <div className="text-center">
            <h1 className="text-3xl font-black text-foreground">
            Welcome to Rydio
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
                Enter your name to get started.
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
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Your Name" {...field} className="pl-10 h-12 rounded-full bg-secondary border-transparent focus:bg-background focus:border-primary" />
                    </div>
                  </FormControl>
                  <FormMessage className="pl-4"/>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-12 rounded-full text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" disabled={isLoading}>
              {isLoading ? 'Joining...' : 'Continue'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
