// AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../components/FirestoreInit';
import { signOut, signInAnonymously, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from "firebase/auth"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loginMethod, setLoginMethod] = useState('');
  const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [anonymousLoading, setAnonymousLoading] = useState(false);
  const [isRegistrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  
  // logout
  const logout = async () => {
    try {
      await signOut(auth); 
      setUser(null); 
      localStorage.removeItem('loginMethod');
      setLoginMethod('');
      setRegistrationModalOpen(false);
      setUserLoggedIn(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // set login method and store it in localStorage
  const setAndStoreLoginMethod = (method) => {
    setLoginMethod(method);
    localStorage.setItem('loginMethod', method);
  };

  // anonymous login
  const handleAnonymousSignIn = async () => {
    try {
      setAnonymousLoading(true);
      const result = await signInAnonymously(auth);
      setUser(result.user);
      setAndStoreLoginMethod("Anonymous");
      setUserLoggedIn(true);
    } catch (error) {
      console.error("Anonymous sign-in error:", error);
    } finally {
      setAnonymousLoading(false);
    }
  };

  // google login
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (credential) {
        const token = credential.accessToken;
        const user = result.user;
        const isNewUser = getAdditionalUserInfo(result)?.isNewUser || false;
        
        setIsNewGoogleUser(isNewUser);
        setUser(user);
        setUserLoggedIn(true);
        
        if (isNewUser) {
          setRegistrationModalOpen(true);
        }
        
        setAndStoreLoginMethod("Google");
      } else {
        console.error("No credentials received from Google sign-in");
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  // get login method from localStorage
  useEffect(() => {
    const storedLoginMethod = localStorage.getItem('loginMethod');
    if (storedLoginMethod) {
      setLoginMethod(storedLoginMethod);
    }
  }, []);

  // listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        setUserLoggedIn(true);
        
        // set login method based on user provider
        const providerId = currentUser.providerData[0]?.providerId;
        if (providerId === 'google.com') {
          setAndStoreLoginMethod('Google');
        } else if (providerId === 'password') {
          setAndStoreLoginMethod('Email');
        } else if (currentUser.isAnonymous) {
          setAndStoreLoginMethod('Anonymous');
        }
      } else {
        setUserLoggedIn(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser,
      logout, 
      loginMethod, 
      setLoginMethod,
      handleAnonymousSignIn,
      handleGoogleSignIn,
      isNewGoogleUser,
      googleLoading,
      anonymousLoading,
      isRegistrationModalOpen,
      setRegistrationModalOpen,
      userLoggedIn,
      setUserLoggedIn,
      setAndStoreLoginMethod
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => useContext(AuthContext);