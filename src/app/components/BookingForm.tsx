// components/BookingForm.tsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { setAndStoreLoginMethod } from './utils/utils';
import { motion } from 'framer-motion';

import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/AuthContext';

const BookingForm = () => {
    const {setLoginMethod, setUser, auth } = useUser();  
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useLanguage();

    const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            setUser(result.user);
            setAndStoreLoginMethod("Email", setLoginMethod);
        } catch (error) {
            console.error(error);
            setError(t('login.errorMessage'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleEmailSignIn} className="space-y-4">            
            <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
                    {t('login.email')}
                </label>
                <input 
                    id="email"
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder={t('login.emailPlaceholder')} 
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white"
                    required
                />
            </div>
            
            <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-400">
                    {t('login.password')}
                </label>
                <input 
                    id="password"
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder={t('login.passwordPlaceholder')} 
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white"
                    required
                />
            </div>
            
            {error && (
                <motion.div 
                    className="p-3 bg-rose-900/30 border border-rose-800 rounded-lg text-rose-300 text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {error}
                </motion.div>
            )}
            
            <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center
                    ${isLoading 
                        ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-lg'
                    }`}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('login.loggingIn')}
                    </>
                ) : t('login.loginButton')}
            </button>
            
            <div className="text-center text-sm text-zinc-500 mt-4">
                {t('login.forgotPassword')} <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors">{t('login.resetHere')}</a>
            </div>
        </form>
    );
};

export default BookingForm;