
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
      let finalStatus: QuotaStatus = 'ok';
      try {
        await pingAI();
      } catch (error: any) {
        const errorMessage = error.message || "Unknown error";
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
          finalStatus = 'exceeded';
        } else {
          console.error("Non-quota error during AI ping:", error);
          finalStatus = 'ok'; // Assume ok for other errors
        }
      } finally {
        // Start fade out animation
        setIsFadingOut(true);
        // Wait for animation to finish, then update status
        setTimeout(() => {
          setQuotaStatus(finalStatus);
        }, 500); // Must match fade-out duration
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
  
  if (quotaStatus === 'pending') {
    return (
      <LoadingScreen
        className={isFadingOut ? 'animate-fade-out' : ''}
        message="Verificando el estado del servicio..."
      />
    );
  }

  if (quotaStatus === 'exceeded') {
    return <QuotaExceededScreen />;
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
