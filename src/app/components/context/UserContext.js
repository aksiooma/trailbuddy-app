// UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged(setCurrentUser);
        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ currentUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
