'use client';
import { useState } from 'react';
import { MainApp } from "@/components/main-app";
import { useUser, FirebaseClientProvider } from '@/firebase';
import { LoginView } from '@/components/auth/login-view';
import { SignupView } from '@/components/auth/signup-view';

function AppContent() {
  const { user, isUserLoading } = useUser();
  const [isLoginView, setIsLoginView] = useState(true);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return isLoginView ? (
      <LoginView onSwitchToSignup={() => setIsLoginView(false)} />
    ) : (
      <SignupView onSwitchToLogin={() => setIsLoginView(true)} />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans p-5 select-none max-w-lg mx-auto overflow-hidden relative selection:bg-primary/30">
      <MainApp />
    </main>
  );
}


export default function Home() {
  return (
    <FirebaseClientProvider>
      <AppContent />
    </FirebaseClientProvider>
  );
}
