//RegisteratationForm.tsx
import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, getAuth, updateProfile } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { FirebaseError, RegistrationFormProps } from './Types/types';
import { motion } from 'framer-motion';
import { isValidEmail, isValidPhone, isValidName, isValidPassword, isFormCompleteAndValid } from './utils/validationUtils';
import { useLanguage } from '../context/LanguageContext';

// A type guard function to check if an error is a FirebaseError
function isFirebaseError(error: any): error is FirebaseError {
    return typeof error === 'object' && 'code' in error && 'message' in error;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ registrationUserData, setIsProfileComplete, setIsRegistrationCompleted, loginMethod, isOpen, onClose }) => {
    const { t } = useLanguage();
    // State initialization
    const [formData, setFormData] = useState({
        firstName: registrationUserData.user?.displayName?.split(' ')[0] || '',
        lastName: registrationUserData.user?.displayName?.split(' ')[1] || '',
        email: registrationUserData.user?.email || '',
        phone: '',
        username: '',
        password: '',
    });

    const [formErrors, setFormErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
    });

    const [registrationError, setRegistrationError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
   
    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        window.addEventListener('keydown', handleEscapeKey);
        return () => window.removeEventListener('keydown', handleEscapeKey);
    }, [isOpen, onClose]);
    
    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Update the state regardless of the value
        setFormData(prevState => ({ ...prevState, [name]: value }));
        // Validation and setting error messages
        if (name === "email" && value && !isValidEmail(value)) {
            setFormErrors(prevErrors => ({ ...prevErrors, email: t('registration.invalidEmail') || "Invalid email format" }));
        } else if (name === "phone" && value && !isValidPhone(value)) {
            setFormErrors(prevErrors => ({ ...prevErrors, phone: t('registration.invalidPhone') || "Invalid phone number" }));
        } else if ((name === "firstName" || name === "lastName") && value && !isValidName(value)) {
            setFormErrors(prevErrors => ({ ...prevErrors, [name]: t('registration.invalidName') || "Name should only contain alphabets and spaces" }));
        } else if (name === "password" && !isValidPassword(value)) {
            setFormErrors(prevErrors => ({ ...prevErrors, password: t('registration.invalidPassword') || "Password should be minimum of eight characters, and contain at least one letter and one number" }));
        } else {
            setFormErrors(prevErrors => ({ ...prevErrors, [name]: "" })); // Clear error
        }
    };

    const handleRegistration = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!isFormCompleteAndValid(formData, formErrors)) {
            console.error("Form data is invalid");
            setIsSubmitting(false);
            return;
        }

        const auth = getAuth();
        const firestore = getFirestore();

        const userData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            username: formData.username || '',
        };

        // Check if the user is signing in via Google or email/password
        if (registrationUserData.user) {
            // User signed in via Google, update or create Firestore document
            try {
                await setDoc(doc(firestore, "USERS", registrationUserData.user.uid), userData);
                console.log("Google user profile updated.");
                // Update Firestore and then set profile as complete
                setIsProfileComplete(true);
                setIsRegistrationCompleted(true);
            } catch (error) {
                console.error("Error updating Google user profile:", error);
                setRegistrationError(t('registration.updateError') || "Error updating profile. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        } else {
            // New user signing up with email/password
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;

                // Update profile with displayName
                await updateProfile(user, {
                    displayName: `${formData.firstName} ${formData.lastName}`
                });

                // Store additional data in Firestore
                await setDoc(doc(firestore, "USERS", user.uid), userData);
                setIsRegistrationCompleted(true);
            } catch (error) {
                if (isFirebaseError(error)) {
                    if (error.code === 'auth/email-already-in-use') {                    
                        setRegistrationError(t('registration.emailInUse') || 'This email address is already in use. Please try another one or log in.');
                    } else {                       
                        setRegistrationError(t('registration.generalError') || 'An error occurred during registration. Please try again.');
                    }
                } else {                  
                    console.error("Registration process encountered an error.");
                    setRegistrationError(t('registration.generalError') || 'An error occurred during registration. Please try again.');
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="w-full">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-white">{t('registration.title') || 'Create Account'}</h2>
                    <p className="mt-2 text-zinc-400">{t('registration.subtitle') || 'Fill in your details to create a new account'}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all duration-200"
                    aria-label="Close modal"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <form onSubmit={handleRegistration} className="p-6 space-y-4">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                            {t('registration.firstName') || 'First Name'} <span className="text-rose-500">*</span>
                        </label>
                        <input 
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder={t('registration.firstNamePlaceholder') || "Enter your first name"}
                            required
                        />
                        {formErrors.firstName && (
                            <p className="mt-1 text-sm text-rose-500">{formErrors.firstName}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                            {t('registration.lastName') || 'Last Name'} <span className="text-rose-500">*</span>
                        </label>
                        <input 
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder={t('registration.lastNamePlaceholder') || "Enter your last name"}
                            required
                        />
                        {formErrors.lastName && (
                            <p className="mt-1 text-sm text-rose-500">{formErrors.lastName}</p>
                        )}
                    </div>
                    
                    {loginMethod !== "Google" && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">
                                {t('registration.email') || 'Email'} <span className="text-rose-500">*</span>
                            </label>
                            <input 
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                placeholder={t('registration.emailPlaceholder') || "Enter your email address"}
                                required
                            />
                            {formErrors.email && (
                                <p className="mt-1 text-sm text-rose-500">{formErrors.email}</p>
                            )}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                            {t('registration.phone') || 'Phone'} <span className="text-rose-500">*</span>
                        </label>
                        <input 
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder={t('registration.phonePlaceholder') || "Enter your phone number"}
                            required
                        />
                        {formErrors.phone && (
                            <p className="mt-1 text-sm text-rose-500">{formErrors.phone}</p>
                        )}
                    </div>
                    
                    {loginMethod !== "Google" && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">
                                {t('registration.password') || 'Password'} <span className="text-rose-500">*</span>
                            </label>
                            <input 
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                placeholder={t('registration.passwordPlaceholder') || "Create a password"}
                                required
                            />
                            {formErrors.password && (
                                <p className="mt-1 text-sm text-rose-500">{formErrors.password}</p>
                            )}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                            {t('registration.username') || 'Username'} <span className="text-zinc-600">(optional)</span>
                        </label>
                        <input 
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder={t('registration.usernamePlaceholder') || "Choose a username (optional)"}
                        />
                    </div>
                </div>
                
                {registrationError && (
                    <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300">
                        {registrationError}
                    </div>
                )}
                
                <div className="flex justify-between items-center mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-2 px-4 rounded-lg font-medium transition-all duration-300 bg-zinc-700 hover:bg-zinc-600 text-white shadow-lg flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {t('modal.back') || 'Back'}
                    </button>
                    
                    <button 
                        type="submit" 
                        disabled={!isFormCompleteAndValid(formData, formErrors) || isSubmitting}
                        className={`py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center
                            ${!isFormCompleteAndValid(formData, formErrors) || isSubmitting
                                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-lg'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('registration.processing') || 'Processing...'}
                            </>
                        ) : (
                            t('registration.register') || 'Register'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistrationForm;
