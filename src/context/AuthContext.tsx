
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import LoadingScreen from '@/components/ui/loading-screen';
import QuotaExceededScreen from '@/components/ui/QuotaExceededScreen';
import { pingAI } from '@/ai/flows/ping-ai';

type LogoutStep = 'none' | 'playingSound' | 'signingOut';
type AIStatus = 'checking' | 'available' | 'unavailable';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BlackScreen = () => <div className="fixed inset-0 z-[200] h-screen w-screen bg-black" />;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutStep, setLogoutStep] = useState<LogoutStep>('none');
  const [aiStatus, setAiStatus] = useState<AIStatus>('checking');
  
  useEffect(() => {
    const checkAiStatus = async () => {
      try {
        await pingAI();
        setAiStatus('available');
      } catch (error) {
        console.error("AI service ping failed:", error);
        setAiStatus('unavailable');
      }
    };
    checkAiStatus();
  }, []);

  useEffect(() => {
    if (aiStatus === 'available') {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
        setLogoutStep('none');
      });
      return () => unsubscribe();
    } else if (aiStatus === 'unavailable') {
      setLoading(false);
    }
  }, [aiStatus]);


  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting the user and loading state
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      // If sign-in fails, ensure we are not stuck in a loading state
      if (!auth.currentUser) {
        setLoading(false);
      }
    }
  };

  const logout = () => {
    if (logoutStep !== 'none') return; 

    setLogoutStep('playingSound');
    const logoutSound = new Audio('/sounds/good-bye.mp3');
    
    const finishSignOut = async () => {
      setLogoutStep('signingOut');
      try {
        await signOut(auth);
        // onAuthStateChanged will set user to null and trigger re-render to login page.
      } catch (error) {
        console.error("Error signing out: ", error);
        setLogoutStep('none'); 
      }
    };
    
    logoutSound.play().catch(e => {
        console.error("Audio playback failed, signing out directly.", e);
        finishSignOut();
    });

    logoutSound.onended = finishSignOut;
    logoutSound.onerror = () => {
      console.error("Failed to play logout sound.");
      finishSignOut(); 
    };
  };
  
  if (aiStatus === 'checking' || loading) {
    return <LoadingScreen />;
  }

  if (aiStatus === 'unavailable') {
    return <QuotaExceededScreen />;
  }

  if (logoutStep === 'playingSound') {
    return <BlackScreen />;
  }
  
  if (logoutStep === 'signingOut') {
    return <LoadingScreen message="Cerrando sesión..." />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
