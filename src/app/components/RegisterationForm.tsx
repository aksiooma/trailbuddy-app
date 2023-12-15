//RegisteratationForm.tsx
import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, getAuth, updateProfile } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { RegistrationUserData } from './Types/types';

import { isValidEmail, isValidPhone, isValidName, isValidPassword, isFormCompleteAndValid } from './utils/validationUtils';


interface RegistrationFormProps {
    registrationUserData: RegistrationUserData;
    setIsProfileComplete: (isComplete: boolean) => void;
    loginMethod: string; // Add this prop to accept the login method
    setIsRegistrationCompleted: (isComplete: boolean) => void;
}

interface FirebaseError {
    code: string;
    message: string;
}

// A type guard function to check if an error is a FirebaseError
function isFirebaseError(error: any): error is FirebaseError {
    return typeof error === 'object' && 'code' in error && 'message' in error;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ registrationUserData, setIsProfileComplete, setIsRegistrationCompleted }) => {
    // State initialization
    const [formData, setFormData] = useState({
        firstName: registrationUserData.user?.displayName || '',
        lastName: registrationUserData.user?.displayName || '',
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

    const [loginMethod, setLoginMethod] = useState('');
    const [registrationError, setRegistrationError] = useState('');

    useEffect(() => {
        // Retrieve login method from localStorage
        const storedLoginMethod = localStorage.getItem('loginMethod');
        if (storedLoginMethod) {
            setLoginMethod(storedLoginMethod);
        }
    }, []);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Update the state regardless of the value
        setFormData(prevState => ({ ...prevState, [name]: value }));
        // Validation and setting error messages
        if (name === "email" && value && !isValidEmail(value)) {
            setFormErrors(prevErrors => ({ ...prevErrors, email: "Invalid email format" }));
        } else if (name === "phone" && value && !isValidPhone(value)) {
            setFormErrors(prevErrors => ({ ...prevErrors, phone: "Invalid phone number" }));
        } else if ((name === "firstName" || name === "lastName") && value && !isValidName(value)) {
            setFormErrors(prevErrors => ({ ...prevErrors, [name]: "Name should only contain alphabets and spaces" }));
        } else if (name === "password" && !isValidPassword(value)) {
            setFormErrors(prevErrors => ({ ...prevErrors, password: "Password should be minimum of eight characters, and contain at least one letter and one number" }));
        } else {
            setFormErrors(prevErrors => ({ ...prevErrors, [name]: "" })); // Clear error
        }
    };

    const handleRegistration = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if (!isFormCompleteAndValid(formData, formErrors)) {
            console.error("Form data is invalid");
            return;
        }

        const auth = getAuth();
        const firestore = getFirestore();

        const userData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
        };

        // Check if the user is signing in via Google or email/password
        if (registrationUserData.user) {
            // User signed in via Google, update or create Firestore document

            try {
                await setDoc(doc(firestore, "USERS", registrationUserData.user.uid), userData);
                console.log("Google user profile updated.");

            } catch (error) {
                console.error("Error updating Google user profile:", error);
            }

            // Update Firestore and then set profile as complete
            setIsProfileComplete(true);
            setIsRegistrationCompleted(true);
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
                
            } catch (error) {
                if (isFirebaseError(error)) {
                    if (error.code === 'auth/email-already-in-use') {                    
                        setRegistrationError('This email address is already in use. Please try another one or log in.');
                    } else {                       
                        setRegistrationError('An error occurred during registration. Please try again.');
                    }
                } else {                  
                    console.error("Registration process encountered an error.");
                }
            }

        }

    };


    return (

        <form onSubmit={handleRegistration} className='flex flex-col space-y-4 p-6 border border-gray-300 rounded-lg text-white'>
            <h1 className='text-white text-lg'><span className="after:content-['*'] text-red-700 mr-1"></span>New User Registeration: </h1>
            <div className="input-container">
                <span className="required-indicator after:content-['*'] text-red-700 mr-1"></span>
                <input className='rounded p-1 border-2 border-teal-500/50 hover:border-teal-700/50 focus:outline-none focus:bg-slate-700/50'
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                />
            </div>
            {formErrors.firstName && <div className="error-message text-danger-300 mt-1">{formErrors.firstName}</div>}
            <div className="input-container">
                <span className="required-indicator after:content-['*'] text-red-700 mr-1"></span>
                <input className='rounded p-1 border-2 border-teal-500/50 hover:border-teal-700/50 focus:outline-none focus:bg-slate-700/50'
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                />
            </div>
            {formErrors.lastName && <div className="error-message text-danger-300 mt-1">{formErrors.lastName}</div>}
            {loginMethod !== "Google" && (
                <div className="input-container">
                    <span className="required-indicator after:content-['*'] text-red-700 mr-1"></span>
                    <input className='rounded p-1 border-2 border-teal-500/50 hover:border-teal-700/50 focus:outline-none focus:bg-slate-700/50'
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                    />
                </div>
            )}
            {formErrors.email && <div className="error-message text-danger-300 mt-1">{formErrors.email}</div>}
            <div className="input-container">
                <span className="required-indicator after:content-['*'] text-red-700 mr-1"></span>
                <input className='rounded p-1 border-2 border-teal-500/50 hover:border-teal-700/50 focus:outline-none focus:bg-slate-700/50'
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone"
                />
            </div>
            {formErrors.phone && <div className="error-message text-danger-300 mt-1">{formErrors.phone}</div>}

            {loginMethod !== "Google" && (
                <div className="input-container">
                    <span className="required-indicator after:content-['*'] text-red-700 mr-1"></span>
                    <input
                        className='rounded p-1 border-2 border-teal-500/50 hover:border-teal-700/50 focus:outline-none focus:bg-slate-700/50'
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                    />
                </div>
            )}
            {formErrors.password && <div className="error-message text-danger-300 mt-1">{formErrors.password}</div>}
            <input
                className='rounded p-1 border-2 border-teal-500/50 hover:border-teal-700/50 focus:outline-none focus:bg-slate-700/50'
                type="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
            />

            {registrationError && (
                <div className="error-message text-red-500">
                    {registrationError}
                </div>
            )}

            <button type="submit" disabled={!isFormCompleteAndValid(formData, formErrors)} className='[text-shadow:_1px_1px_0_rgb(0_0_0_/_40%)] mt-4 border-white bg-teal-500/70 border-2 border-slate-500/50 hover:bg-blue-900/50 hover:text-white text-shadow text-white font-bold rounded-full transition-colors duration-200 py-2 px-4 text-slate-900/50 disabled:bg-gray-500/50' >Register</button>

        </form>

    );
};

export default RegistrationForm;
