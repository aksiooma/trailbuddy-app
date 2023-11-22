// components/BookingForm.tsx
import React, { useState } from 'react';
import { User, signInWithEmailAndPassword, getAuth } from "firebase/auth";

import { motion } from 'framer-motion';

const BookingForm = () => {
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = getAuth();
    const [error, setError] = useState(''); // State to store the error message


    const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            setUser(result.user);
        } catch (error) {
            console.error(error);
            // Set a user-friendly error message
            setError('Login failed. Please check your email and password.');
        }
    };


    return (
        <form onSubmit={handleEmailSignIn} className='flex flex-col space-y-4 p-6 border border-gray-300 rounded-lg'>
            <label>Existing User Login:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className='rounded p-1 border-2 border-teal-500/50 hover:border-teal-700/50 focus:outline-none focus:bg-slate-700/50' />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className='rounded p-1 border-2 border-teal-500/50 hover:border-teal-700/50  focus:outline-none focus:bg-slate-700/50' />
            {error && <motion.div className="text-red-500" initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}>{error}</motion.div>} {/* Display error message */}
            <button className="bg-teal-500/50 border-2 border-white-700/50 hover:bg-blue-700/50 text-white font-bold rounded-full transition-colors duration-200 p-2 mx-5" type="submit">Login</button>
        </form>
    );
};

export default BookingForm;