//BasketComponent.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc } from "firebase/firestore"
import { BasketComponentProps } from './Types/types';
import { isValidEmail, isValidPhone, isValidName, isFormCompleteAndValid } from './utils/validationUtils';
import { fetchUserData } from './utils/fetchUserData'
import { useLanguage } from '../context/LanguageContext';

//Calculate day difference
function calculateDayDifference(startDate: { getTime: () => number; }, endDate: { getTime: () => number; }) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffInMs = endDate.getTime() - startDate.getTime();
    return Math.round(diffInMs / msPerDay);
}

//Price
const calculateTotalPrice = (basket: any[]) => {
    return basket.reduce((total: number, item: any) => {
        // If item.totalPrice is defined, use it
        if (item.totalPrice) {
            return total + item.totalPrice;
        }
        
        // Otherwise calculate the price based on days (older method)
        const startDate = new Date(item.startDate);
        const endDate = item.endDate ? new Date(item.endDate) : startDate;
        const dayDifference = calculateDayDifference(startDate, endDate);
        
        // Add accessory prices
        let accessoriesPrice = 0;
        if (item.accessories && item.accessories.length > 0) {
            const accessoriesList = [
                { id: 'helmet', price: 5 },
                { id: 'lock', price: 3 },
                { id: 'lights', price: 4 },
                { id: 'bottle', price: 2 }
            ];
            
            accessoriesPrice = item.accessories.reduce((acc: number, accessoryId: string) => {
                const accessory = accessoriesList.find(a => a.id === accessoryId);
                return acc + (accessory ? accessory.price : 0);
            }, 0);
        }
        
        return total + ((item.price * (dayDifference + 1)) + accessoriesPrice) * item.quantity;
    }, 0);
};


const BasketComponent: React.FC<BasketComponentProps> = ({
    basket,
    removeFromBasket,
    IsExtendedViewVisible,
    onHandleCheckout,
    loginMethod,
    setBasket,
    db,
    user,
    setIsRegistrationCompleted,
    isRegistrationCompleted


}) => {
    const { t } = useLanguage();

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        const loadData = async () => {
            if (loginMethod === "Google" || loginMethod === "Email") {
                if (currentUser && currentUser.uid) {
                    const userData = await fetchUserData(currentUser.uid);
                    if (userData) {
                        setFormData({
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                            email: userData.email || '',
                            phone: userData.phone || '',
                        });
                    }
                }
            } else {
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                });
            }
        };

        loadData();

        // Reset the flag
        setIsRegistrationCompleted(false);
    }, [loginMethod, isRegistrationCompleted, setIsRegistrationCompleted]);

    const renderCheckoutButton = () => {
        if (basket.length > 0 && !IsExtendedViewVisible) {
            return (
                <div className="mt-4">
                    <button
                        className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-lg"
                        onClick={onHandleCheckout}
                    >
                        {t('basket.proceedToCheckout')}
                    </button>
                </div>
            );
        }
        return null;
    };

    const handleCheckout = async () => {
        // Ensure all required fields are filled
        if (!isFormValid()) {
            alert("Please fill in all required fields.");
            return;
        }

        // Ensure email is valid
        if (!isValidEmail(formData.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!isValidPhone(formData.phone)) {
            alert("Please enter a valid phone number.");
            return;
        }


        try {
            // Iterate over basket items and update reservation status in Firestore
            for (const item of basket) {
                if (item.reservationId) {
                    const reservationRef = doc(db, "reservations", item.reservationId);
                    await updateDoc(reservationRef, { status: "confirmed" });
                }
            }

            // Clear the basket and show confirmation message
            setBasket([]);

            // Clear the basket from local storage
            const userBasketKey = `basket_${user?.uid}`;
            localStorage.removeItem(userBasketKey);

            // Show confirmation message
            alert("Your reservation is confirmed, thank you!");
        } catch (error) {
            // Handle errors
            console.error("Error confirming reservation: ", error);
            alert("There was an error processing your reservation.");
        }
    };
    const [payment, setPayment] = useState("Regular")

    const isFormValid = () => {
        if (loginMethod === "Anonymous") {
            return formData.firstName && formData.lastName && formData.email && formData.phone;
        }
        return true; // Form is valid for logged-in users
    };


    const [formErrors, setFormErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });


    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });

    const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
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
        } else {
            setFormErrors(prevErrors => ({ ...prevErrors, [name]: "" })); 
        }
    };

    {
        loginMethod === "Anonymous" && (
            <input type="text" required />
        )
    }
    {
        loginMethod !== "Anonymous" && (
            <input type="text" disabled />
        )
    }


    const renderExtendedView = () => {
        if (IsExtendedViewVisible && basket.length > 0) {
            return (
                <motion.div 
                    className="mt-6 p-6 bg-zinc-800/30 rounded-lg border border-zinc-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                >
                    <h2 className="text-lg font-medium text-white mb-4">
                        <span className="text-rose-500 mr-1">*</span>
                        {t('checkout.contactInformation')}
                    </h2>
                    
                    <div className="space-y-3">
                        <div>
                            <input 
                                type="text"
                                placeholder={t('checkout.firstName')}
                                className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-60"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                disabled={loginMethod !== "Anonymous"} 
                            />
                            {formErrors.firstName && <div className="mt-1 text-rose-500 text-sm">{formErrors.firstName}</div>}
                        </div>
                        
                        <div>
                            <input 
                                type="text"
                                placeholder={t('checkout.lastName')}
                                className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-60"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                disabled={loginMethod !== "Anonymous"} 
                            />
                            {formErrors.lastName && <div className="mt-1 text-rose-500 text-sm">{formErrors.lastName}</div>}
                        </div>
                        
                        <div>
                            <input 
                                type="email"
                                placeholder={t('checkout.email')}
                                className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-60"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={loginMethod !== "Anonymous"} 
                            />
                            {formErrors.email && <div className="mt-1 text-rose-500 text-sm">{formErrors.email}</div>}
                        </div>
                        
                        <div>
                            <input 
                                type="tel"
                                placeholder={t('checkout.phone')}
                                className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-60"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={loginMethod !== "Anonymous"} 
                            />
                            {formErrors.phone && <div className="mt-1 text-rose-500 text-sm">{formErrors.phone}</div>}
                        </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        <h2 className="text-lg font-medium text-white mb-3">{t('checkout.paymentMethod')}</h2>
                        <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-700 flex items-center">
                            <input 
                                type="radio" 
                                name="payment" 
                                value="Regular" 
                                id="regular" 
                                defaultChecked={payment === "Regular"} 
                                className="mr-3 h-4 w-4 text-teal-500 focus:ring-teal-400" 
                            />
                            <label htmlFor="regular" className="text-white">{t('checkout.payAtRetrieval')}</label>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <button 
                            disabled={!isFormCompleteAndValid(formData, formErrors)} 
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center
                                ${!isFormCompleteAndValid(formData, formErrors)
                                    ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-lg'
                                }`}
                            onClick={handleCheckout}
                        >
                            {t('checkout.confirmBooking')}
                        </button>
                    </div>
                </motion.div>
            );
        }
        return null;
    };

    // Määritellään accessories-array käyttäen t-funktiota
    const accessories = [
        { id: 'helmet', name: t('accessories.helmet'), price: 5 },
        { id: 'lock', name: t('accessories.lock'), price: 3 },
        { id: 'lights', name: t('accessories.lights'), price: 4 },
        { id: 'bottle', name: t('accessories.bottle'), price: 2 }
    ];

    // Käytetään accessoriesData-muuttujaa accessories-arrayn sijaan
    const getAccessoryName = (accessoryId: string): string => {
        // Määritellään accessory-nimet käännösten avulla
        const accessoryNames: Record<string, string> = {
            'helmet': t ? t('accessories.helmet') : 'Helmet',
            'lock': t ? t('accessories.lock') : 'Lock',
            'lights': t ? t('accessories.lights') : 'Lights',
            'bottle': t ? t('accessories.bottle') : 'Water Bottle'
        };
        
        return accessoryNames[accessoryId] || accessoryId;
    };

    return (
        <motion.div 
            className="mt-6 bg-zinc-800/30 rounded-lg border border-zinc-700 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
                <h2 className="text-lg font-medium text-white font-metrophic">{t('basket.yourBasket')}</h2>
                {basket.length > 0 && (
                    <span className="bg-teal-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                        {basket.length}
                    </span>
                )}
            </div>
            
            <div className="overflow-y-auto max-h-[300px] p-4 space-y-3">
                {basket.length === 0 ? (
                    <div className="text-center py-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800/50 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <p className="text-zinc-400">{t('basket.emptyBasket')}</p>
                    </div>
                ) : (
                    basket.map((item, index) => {
                        // Convert strings to Date objects
                        const startDate = new Date(item.startDate);
                        const endDate = item.endDate ? new Date(item.endDate) : startDate;
                        // Calculate day difference
                        const dayDifference = calculateDayDifference(startDate, endDate);
                        const days = dayDifference + 1; // Number of days
                        
                        // Calculate total price
                        let itemTotalPrice = item.totalPrice;
                        if (!itemTotalPrice) {
                            // If totalPrice is not defined, calculate it
                            let accessoriesPrice = 0;
                            if (item.accessories && item.accessories.length > 0) {
                                accessoriesPrice = item.accessories.reduce((acc: number, accessoryId: string) => {
                                    const accessory = accessories.find(a => a.id === accessoryId);
                                    return acc + (accessory ? accessory.price : 0);
                                }, 0);
                            }
                            itemTotalPrice = ((item.price * days) + accessoriesPrice) * item.quantity;
                        }
                        
                        return (
                            <motion.div 
                                key={index}
                                className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 relative"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <button 
                                    className="absolute top-2 right-2 p-1 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                                    onClick={() => removeFromBasket(index)}
                                    aria-label="Remove item"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                
                                <h3 className="text-white font-medium mb-2">{item.name}</h3>
                                
                                <div className="grid grid-cols-2 gap-2 text-sm text-zinc-400 mb-3">
                                    <div>
                                        <span className="block">{t('basket.date')}:</span>
                                        <span className="text-teal-400">
                                            {startDate.toLocaleDateString('fi-FI')}
                                            {endDate && startDate.getTime() !== endDate.getTime() && 
                                                ` - ${endDate.toLocaleDateString('fi-FI')}`}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <span className="block">{t('basket.quantity')}:</span>
                                        <span className="text-teal-400">{item.quantity}</span>
                                    </div>
                                    
                                    <div>
                                        <span className="block">{t('basket.size')}:</span>
                                        <span className="text-teal-400">{item.size}</span>
                                    </div>
                                    
                                    <div>
                                        <span className="block">{t('basket.days')}:</span>
                                        <span className="text-teal-400">{days}</span>
                                    </div>
                                    
                                    <div>
                                        <span className="block">{t('basket.price')}:</span>
                                        <span className="text-teal-400 font-medium">
                                            {itemTotalPrice}€
                                        </span>
                                    </div>
                                </div>
                                
                                {item.accessories && item.accessories.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-zinc-800">
                                        <span className="block text-sm text-zinc-400 mb-1">{t('basket.accessories')}:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {item.accessories.map(accessoryId => (
                                                <span 
                                                    key={accessoryId}
                                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-zinc-800 text-teal-400"
                                                >
                                                    {getAccessoryName(accessoryId)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>
            
            {basket.length > 0 && (
                <div className="p-4 border-t border-zinc-700 bg-zinc-800/50">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400">{t('basket.total')}:</span>
                        <span className="text-xl font-bold text-teal-400">{calculateTotalPrice(basket)}€</span>
                    </div>
                    {renderCheckoutButton()}
                </div>
            )}
            
            {renderExtendedView()}
        </motion.div>
    );
};

export default BasketComponent;
