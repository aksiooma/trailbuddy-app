// components/Login.tsx
import React, { useState, useEffect } from 'react';
import { User, getAuth, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import Booking from './Booking';
import { BikeSizeKey, BookingProps } from './Types/types'
import { motion } from 'framer-motion';
import BookingForm from './BookingForm';


// Add a prop type for selectedBike

const Login: React.FC<BookingProps> = ({ selectedBike, selectedSize }) => {
    const [user, setUser] = useState<User | null>(null);
    const auth = getAuth();
    const [loginMethod, setLoginMethod] = useState<string>('');

    useEffect(() => {
        const storedLoginMethod = localStorage.getItem('loginMethod');
        if (storedLoginMethod) {
            setLoginMethod(storedLoginMethod);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                // Set login method based on user's provider
                const providerId = user.providerData[0]?.providerId;
                if (providerId === 'google.com') {
                    setAndStoreLoginMethod('Google');
                } else if (providerId === 'password') {
                    setAndStoreLoginMethod('Email');
                } else if (user.isAnonymous) {
                    setAndStoreLoginMethod('Anonymous');
                }
            } else {
                setUser(null);
                setLoginMethod('');
            }
        });
    
        return () => unsubscribe();
    }, [auth]);

    // Set login method and store in localStorage
    const setAndStoreLoginMethod = (method: string) => {
        setLoginMethod(method);
        localStorage.setItem('loginMethod', method);
    };

    useEffect(() => {
        // Listener for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // This will be null if not logged in
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [auth]);


    const handleAnonymousSignIn = async () => {
        try {
            const result = await signInAnonymously(auth);
            setUser(result.user);
            setAndStoreLoginMethod("Anonymous");


        } catch (error) {
            console.error(error);
        }
    };


    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            setUser(result.user);
            setAndStoreLoginMethod("Google");
        } catch (error) {
            console.error(error);
        }
    };

    function isBikeSizeKey(size: string | null): size is BikeSizeKey {
        return ['Small', 'Medium', 'Large'].includes(size ?? '');
    }

    // Function to handle logout
    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                // Sign-out successful.
                setUser(null); // Update the user state to null
                localStorage.removeItem('loginMethod');
                setLoginMethod('');
            })
            .catch((error) => {
                // An error happened.
                console.error(error);
            });
    };


    if (user) {
        // Ensure selectedSize is a valid BikeSizeKey or null
        const validatedSize = isBikeSizeKey(selectedSize) ? selectedSize : null;
        return <Booking selectedBike={selectedBike} selectedSize={validatedSize} user={user} onLogout={handleLogout} loginMethod={loginMethod} />;
    }

    return (
        <motion.div className='Login' initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}>
            <BookingForm setLoginMethod={setLoginMethod} />
            <div className="text-base text-gray-600 flex flex-col space-y-4 p-6 border border-gray-300 rounded-lg">
                <button className="bg-teal-500/50 border-2 border-white-500/50 hover:bg-blue-700/50 text-white font-bold rounded-full transition-colors duration-200 p-2 mx-5" onClick={handleAnonymousSignIn}>Login as Visitor</button>
                <button className="bg-teal-500/50 border-2 border-white-500/50 hover:bg-blue-700/50 text-white font-bold rounded-full transition-colors duration-200 p-1 mx-5" onClick={handleGoogleSignIn}>Login with Google</button>
            </div>
        </motion.div>
    );
};

export default Login;
