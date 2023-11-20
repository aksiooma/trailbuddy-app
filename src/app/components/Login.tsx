// components/Login.tsx
import React, { useState, useEffect } from 'react';
import { User, getAuth, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import Booking from './Booking';
import { Bike } from './Types/types'
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import BookingForm from './BookingForm';


// Add a prop type for selectedBike
interface BookingProps {
    selectedBike: Bike | null; // Allow selectedBike to be null
}

const Login: React.FC<BookingProps> = ({ selectedBike }) => {
    const [user, setUser] = useState<User | null>(null);
    const auth = getAuth();


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
        } catch (error) {
            console.error(error);
        }
    };


    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            setUser(result.user);
        } catch (error) {
            console.error(error);
        }
    };


    // Function to handle logout
    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                // Sign-out successful.
                setUser(null); // Update the user state to null
            })
            .catch((error) => {
                // An error happened.
                console.error(error);
            });
    };


    if (user) {
        return <Booking selectedBike={selectedBike} user={user} onLogout={handleLogout} />;
    }

    return (
        <motion.div className='Login' initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}>
            <BookingForm />
            <div className="text-base text-gray-600 flex flex-col space-y-4 p-6 border border-gray-300 rounded-lg">
                <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-full transition-colors duration-200 p-2 mx-5 " onClick={handleAnonymousSignIn}>Login as Visitor</Button>
                <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-full transition-colors duration-200 p-1 mx-5" onClick={handleGoogleSignIn}>Login with Google</Button>
            </div>
        </motion.div>
    );
};

export default Login;
