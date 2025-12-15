import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from '../firebase/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you might use Google Auth or Email/Pass
    // For this demo, we ensure anonymous sign-in if no user
    const ensureAuth = async () => {
       // Optional: Insert custom token logic here if needed
       // await signInWithCustomToken(auth, token);
       // Fallback to anonymous
       if (!auth.currentUser) {
         await signInAnonymously(auth).catch(console.error);
       }
    };
    
    ensureAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
