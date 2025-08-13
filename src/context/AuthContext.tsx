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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => void; // Cambiado para no ser una promesa directa
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
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
    setIsLoggingOut(true);
    const logoutSound = new Audio('/sounds/good-bye.mp3');
    logoutSound.play();

    logoutSound.onended = async () => {
      try {
        await signOut(auth);
        // El onAuthStateChanged se encargará de actualizar el estado del usuario
      } catch (error) {
        console.error("Error signing out: ", error);
      } finally {
        // Retrasamos un poco para asegurar que el cambio de estado se propague
        setTimeout(() => setIsLoggingOut(false), 200);
      }
    };
    
    // Fallback en caso de que el sonido no se pueda reproducir
    logoutSound.onerror = async () => {
      console.error("Failed to play logout sound.");
       try {
        await signOut(auth);
      } catch (error) {
        console.error("Error signing out after sound error: ", error);
      } finally {
        setTimeout(() => setIsLoggingOut(false), 200);
      }
    }
  };

  // Renderiza la pantalla de carga durante el cierre de sesión
  if (isLoggingOut) {
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
