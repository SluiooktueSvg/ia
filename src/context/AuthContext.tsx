
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
type QuotaStatus = 'pending' | 'ok' | 'exceeded';

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
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus>('pending');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const checkQuota = async () => {
      try {
        await pingAI();
        setQuotaStatus('ok');
      } catch (error: any) {
        const errorMessage = error.message || "Unknown error";
        // Only consider it a quota issue if the error explicitly says so.
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
          setQuotaStatus('exceeded');
        } else {
          // For any other transient errors, assume the service is available
          // and let the user try to log in. The error will be caught later
          // if it's persistent.
          console.warn("AI service ping failed with a non-quota error, proceeding:", error);
          setQuotaStatus('ok'); 
        }
      }
    };

    checkQuota();
  }, []);

  useEffect(() => {
    if (quotaStatus === 'ok') {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
        setLogoutStep('none');
      });
      return () => unsubscribe();
    } else if (quotaStatus === 'exceeded') {
      // If quota is exceeded, we are done "loading" and can show the quota screen.
      setLoading(false);
    }
  }, [quotaStatus]);


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
  
  if (quotaStatus === 'pending' || (quotaStatus === 'ok' && loading)) {
    return <LoadingScreen />;
  }

  if (quotaStatus === 'exceeded') {
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
