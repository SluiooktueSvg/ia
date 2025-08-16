
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
    // Perform the API quota check first
    const checkQuota = async () => {
      try {
        await pingAI();
        setIsFadingOut(true);
        setTimeout(() => {
          setQuotaStatus('ok');
        }, 500); // Corresponds to fade-out duration
      } catch (error: any) {
        const errorMessage = error.message || "Unknown error";
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
          setQuotaStatus('exceeded');
        } else {
          // If it's a different error (e.g., network), let the app load but log it.
          console.error("Non-quota error during AI ping:", error);
           setIsFadingOut(true);
            setTimeout(() => {
                setQuotaStatus('ok');
            }, 500);
        }
      }
    };

    checkQuota();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      setLogoutStep('none'); // Reset on auth change
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      if (!user) {
        setLoading(false);
      }
    }
  };

  const logout = () => {
    if (logoutStep !== 'none') return; // Prevent multiple calls

    setLogoutStep('playingSound');
    const logoutSound = new Audio('/sounds/good-bye.mp3');
    logoutSound.play();

    const finishSignOut = async () => {
      setLogoutStep('signingOut');
      try {
        await signOut(auth);
        // onAuthStateChanged will handle the rest
      } catch (error) {
        console.error("Error signing out: ", error);
        setLogoutStep('none'); // Reset on error
      }
    };
    
    logoutSound.onended = finishSignOut;
    logoutSound.onerror = () => {
      console.error("Failed to play logout sound.");
      finishSignOut(); // Proceed with logout even if sound fails
    };
  };

  // Render based on quota status first
  if (quotaStatus === 'exceeded') {
    return <QuotaExceededScreen />;
  }

  if (quotaStatus === 'pending') {
    return <LoadingScreen className={isFadingOut ? 'animate-fade-out' : ''} />;
  }

  // --- From here, quota is 'ok' ---
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
