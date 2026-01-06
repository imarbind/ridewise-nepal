'use client';
import { useState } from 'react';
import { MainApp } from "@/components/main-app";
import { useUser } from '@/firebase';
import { LoginView } from '@/components/auth/login-view';
import { SignupView } from '@/components/auth/signup-view';
import { NepalBackground } from '@/components/layout/nepal-background';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const [isLoginView, setIsLoginView] = useState(true);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <NepalBackground />
        {isLoginView ? (
          <LoginView onSwitchToSignup={() => setIsLoginView(false)} />
        ) : (
          <SignupView onSwitchToLogin={() => setIsLoginView(true)} />
        )}
      </>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-5 select-none max-w-lg mx-auto overflow-hidden relative selection:bg-primary/30">
      <MainApp />
    </main>
  );
}
