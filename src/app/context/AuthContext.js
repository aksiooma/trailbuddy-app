// AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../components/FirestoreInit';
import { signOut } from "firebase/auth"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const logout = async () => {
    try {
        await signOut(auth); // Kirjaa käyttäjä ulos Firebase-authentikoinnista
        setUser(null); // Päivitä käyttäjän tila
        localStorage.removeItem('loginMethod'); // Poista kirjautumistapa
        setLoginMethod('');
        setRegistrationModalOpen(false);
    } catch (error) {
        console.error("Logout error:", error);
    }
};

  const login = () => setUser(true);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => useContext(AuthContext);