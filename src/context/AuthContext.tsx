
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

type LogoutStep = 'none' | 'playingSound' | 'signingOut';

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

  useEffect(() => {
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

  if (logoutStep === 'playingSound') {
    return <BlackScreen />;
  }
  
  if (logoutStep === 'signingOut') {
    return <LoadingScreen />;
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
