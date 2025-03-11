// AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../components/FirestoreInit';
import { signOut } from "firebase/auth"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loginMethod, setLoginMethod] = useState('');
  
  const logout = async () => {
    try {
        await signOut(auth); 
        setUser(null); 
        localStorage.removeItem('loginMethod');
        setLoginMethod('');
        setRegistrationModalOpen(false);
    } catch (error) {
        console.error("Logout error:", error);
    }
};


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, logout, loginMethod, setLoginMethod }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => useContext(AuthContext);