'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { User, Lock } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';

interface LoginViewProps {
  onSwitchToSignup: () => void;
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginView({ onSwitchToSignup }: LoginViewProps) {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
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
            Sign in
            </h1>
            <p className="text-sm text-slate-500 mt-2">
                Not registered?{' '}
                <Button variant="link" onClick={onSwitchToSignup} className="p-0 text-blue-600">
                    Click here to register
                </Button>
            </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
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
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <label htmlFor="remember" className="text-slate-600 cursor-pointer">Remember me</label>
                </div>
                <Button variant="link" className="p-0 text-blue-600">Forgot Password?</Button>
            </div>
            <Button type="submit" className="w-full h-12 rounded-full text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
