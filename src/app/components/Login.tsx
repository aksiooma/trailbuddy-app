// components/Login.tsx
import React, { useState, useEffect } from 'react';
import Booking from './Booking';
import { BikeSizeKey, BookingProps, RegistrationUserData } from './Types/types'
import BookingForm from './BookingForm';
import RegistrationForm from './RegisterationForm';
import Modal from './RegisterationModal';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/AuthContext';

const Login: React.FC<BookingProps> = ({ 
    selectedAccessories, 
    setSelectedAccessories, 
    accessories, 
    selectedBike, 
    selectedSize, 
    setIsRegistrationCompleted, 
    isRegistrationCompleted, 
    handleAccessoryToggle, 
    startDate, 
    endDate, 
    selectedBikeAvailableStock, 
    dateAvailability, 
    setSelectedBikeAvailableStock, 
    setDateAvailability, 
    setEndDate, 
    setStartDate, 
    datePickerRef,
    basketRef,
}) => {
    const { t } = useLanguage();
    const { 
        user, 
        logout, 
        loginMethod, 
        handleAnonymousSignIn, 
        handleGoogleSignIn, 
        googleLoading, 
        anonymousLoading, 
        isRegistrationModalOpen, 
        setRegistrationModalOpen,
    } = useUser();
    
    const [registrationUserData, setRegistrationUserData] = useState<RegistrationUserData>({ user: null, token: undefined });
    const [isProfileComplete, setIsProfileComplete] = useState(true);

    const handleNewUserClick = () => {
        setRegistrationModalOpen(true);
    };

    function isBikeSizeKey(size: string | null): size is BikeSizeKey {
        return ['Small', 'Medium', 'Large'].includes(size ?? '');
    }
    
    if (user) {
        // Ensure selectedSize is a valid BikeSizeKey or null
        const validatedSize = isBikeSizeKey(selectedSize) ? selectedSize : null;
        return <Booking 
            selectedBike={selectedBike} 
            selectedSize={validatedSize} 
            selectedAccessories={selectedAccessories} 
            setSelectedAccessories={setSelectedAccessories} 
            accessories={accessories} 
            handleAccessoryToggle={handleAccessoryToggle} 
            user={user} 
            onLogout={logout} 
            loginMethod={loginMethod} 
            isProfileComplete={isProfileComplete} 
            setRegistrationModalOpen={setRegistrationModalOpen} 
            setIsProfileComplete={setIsProfileComplete} 
            setIsRegistrationCompleted={setIsRegistrationCompleted} 
            isRegistrationCompleted={isRegistrationCompleted}
            startDate={startDate}
            endDate={endDate}
            selectedBikeAvailableStock={selectedBikeAvailableStock}
            dateAvailability={dateAvailability}
            setSelectedBikeAvailableStock={setSelectedBikeAvailableStock}
            setDateAvailability={setDateAvailability}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            datePickerRef={datePickerRef}
            basketRef={basketRef}
        />;
    }

    return (
        <div className="relative font-schibsted">
            {!isRegistrationModalOpen ? (
                // Login-component
                <div className="bg-gradient-to-b from-zinc-900/50 to-zinc-900/30 backdrop-blur-sm rounded-xl border border-zinc-800 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-zinc-800">
                        <h2 className="text-xl font-semibold text-white">{t('login.title') || 'Login to Continue'}</h2>
                        <p className="mt-2 text-zinc-400">{t('login.subtitle') || 'Sign in to access our bike rental services'}</p>
                    </div>
                    
                    <div className="p-6">
                        <BookingForm />
                        
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-zinc-900 text-zinc-400">{t('login.orContinueWith') || 'Or continue with'}</span>
                                </div>
                            </div>
                            
                            <div className="mt-6 grid grid-cols-1 gap-3">
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={googleLoading}
                                    className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg flex items-center justify-center"
                                >
                                    {googleLoading ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                                        </svg>
                                    )}
                                    {t('login.continueWithGoogle') || 'Continue with Google'}
                                </button>
                                
                                <button
                                    onClick={handleAnonymousSignIn}
                                    disabled={anonymousLoading}
                                    className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white shadow-lg flex items-center justify-center"
                                >
                                    {anonymousLoading ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                    {t('login.continueAsGuest') || 'Continue as Guest'}
                                </button>
                                
                                <button
                                    onClick={handleNewUserClick}
                                    className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg flex items-center justify-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    {t('login.createAccount') || 'Create Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Registration modal
                <Modal 
                    isOpen={isRegistrationModalOpen} 
                    onClose={() => setRegistrationModalOpen(false)} 
                    loginMethod={loginMethod}
                >
                    <RegistrationForm 
                        registrationUserData={{
                            user: registrationUserData.user,
                            token: registrationUserData.token
                        }} 
                        setIsProfileComplete={setIsProfileComplete} 
                        loginMethod={loginMethod} 
                        isOpen={isRegistrationModalOpen}
                        onClose={() => setRegistrationModalOpen(false)}
                        setIsRegistrationCompleted={setIsRegistrationCompleted}
                    />
                </Modal>
            )}
        </div>
    );
};

export default Login;
