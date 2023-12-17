import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc } from "firebase/firestore"
import { BasketComponentProps } from './Types/types';
import { isValidEmail, isValidPhone, isValidName, isFormCompleteAndValid } from './utils/validationUtils';
import { fetchUserData } from './utils/fetchUserData'



//Calculate day difference
function calculateDayDifference(startDate: { getTime: () => number; }, endDate: { getTime: () => number; }) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffInMs = endDate.getTime() - startDate.getTime();
    return Math.round(diffInMs / msPerDay);
}

//Price
const calculateTotalPrice = (basket: any[]) => {
    return basket.reduce((total: number, item: { startDate: string | number | Date; endDate: string | number | Date; price: number; quantity: number; }) => {
        const startDate = new Date(item.startDate);
        const endDate = item.endDate ? new Date(item.endDate) : startDate;
        const dayDifference = calculateDayDifference(startDate, endDate);
        return total + (item.price * (item.quantity + dayDifference));
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
                <div className='flex flex-col justify-between items-center'>
                    <button
                        className="[text-shadow:_1px_1px_0_rgb(0_0_0_/_40%)] mt-4 bg-teal-600/70 border-2 border-slate-500/50 hover:bg-orange-900/50 hover:text-white text-shadow text-white font-bold rounded-full transition-colors duration-200 py-2 px-4 text-slate-900/50"
                        onClick={onHandleCheckout}
                    >
                        Proceed to Checkout
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
            const userBasketKey = `basket_${user?.uid}`; // Adjust this based on how you've set the key
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
            setFormErrors(prevErrors => ({ ...prevErrors, [name]: "" })); // Clear error
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
                <motion.div className="extended-view p-5 border-4 border-teal-700/50 rounded-lg mt-1 bg-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}>
                    <h2 className='text-slate-900/70 text-lg'>   <span className="after:content-['*'] text-red-700 mr-1"></span>Contact Information:</h2>
                    <form className='contact form round'>
                        <input type="text"
                            placeholder="First Name"
                            className='rounded p-3 w-full mt-2 disabled:opacity-60  disabled:text-opacity-60'
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            disabled={loginMethod !== "Anonymous"} />
                        {formErrors.firstName && <div className="error-message text-danger-300 mt-1">{formErrors.firstName}</div>}
                        <input type="text"
                            placeholder="Last Name"
                            className='rounded p-3 w-full mt-2 disabled:opacity-60  disabled:text-gray-500'
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            disabled={loginMethod !== "Anonymous"} />
                        {formErrors.lastName && <div className="error-message text-danger-300 mt-1">{formErrors.lastName}</div>}

                        <input type="text"
                            placeholder="Email"
                            className='rounded p-3 w-full mt-1 disabled:opacity-60  disabled:text-gray-500'
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={loginMethod !== "Anonymous"} />
                        {formErrors.email && <div className="error-message text-danger-300 mt-1">{formErrors.email}</div>}
                        <input type="tel"
                            placeholder="Phone"
                            className='rounded p-3 w-full mt-2 disabled:opacity-60  disabled:text-gray-500'
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={loginMethod !== "Anonymous"} />
                        {formErrors.phone && <div className="error-message text-danger-300 mt-1">{formErrors.phone}</div>}
                        <div className="payment-methods p-2 border-2 border-slate-500/50 rounded-lg mt-2 bg-teal-700/50">
                            <h2 className='mx-2 text-white-900/50 mb-2 text-lg [text-shadow:_1px_1px_0_rgb(0_0_0_/_40%)]'>Payment Method:</h2>
                            <div className="p-4 border-t-4 shadow rounded p-2 bg-gray-900/50 border-1 border-slate-900/50">
                                <input type="radio" name="payment" value="Regular" id="regular" defaultChecked={payment === "Regular"} className='' />
                                <label htmlFor="regular" className='mx-2 text-white-900/50 [text-shadow:_1px_1px_0_rgb(0_0_0_/_40%)]'>Pay at the retrieval</label>
                            </div>
                        </div>
                    </form>
                    <div className='flex flex-col justify-between items-center'>
                        <button disabled={!isFormCompleteAndValid(formData, formErrors)} className='[text-shadow:_1px_1px_0_rgb(0_0_0_/_40%)] mt-4 bg-teal-500/70 border-2 border-slate-500/50 hover:bg-orange-900/50 hover:text-white text-shadow text-white font-bold rounded-full transition-colors duration-200 py-2 px-4 text-slate-900/50 disabled:bg-gray-500/50' onClick={handleCheckout}>Confirm Booking</button>
                    </div>
                </motion.div>
            );
        }
        return null;
    };


    return (
        <motion.div className="basket p-5 border-4 border-teal-700/50 rounded-lg mt-5 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}>
            <div className="overflow-y-auto max-h-[300px] sm:max-h-[500px]">
                {basket.map((item, index) => {
                    // Convert strings to Date objects
                    const startDate = new Date(item.startDate);
                    const endDate = item.endDate ? new Date(item.endDate) : startDate;
                    // Calculate day difference
                    const dayDifference = calculateDayDifference(startDate, endDate);
                    return (

                        <motion.div className='p-4 border-2 border-teal-300/50 rounded-lg bg-black flex flex-col justify-between items-start' key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}>

                            <div className='p-2 bg-gray-900/50 border-1 border-white-500/50 rounded'>
                                <h1 className='text-lg mb-1'>{item.name}</h1> <hr></hr><h3 className='mt-1'>Date:
                                    <span className='text-lg text-[#FFD700] mx-1'>{item.startDate.toLocaleDateString('en-GB')}
                                        {item.endDate ? ` - ${item.endDate.toLocaleDateString('en-GB')}` : ''}</span></h3>
                                <h2 className='mt-1 mb-1'>Quantity: <span className='text-lg text-[#FFD700]'>{item.quantity}</span></h2>
                                <h4 className='mt-1'>Size: <span className='text-lg text-[#FFD700]'>{item.size}</span></h4>
                                <hr></hr>
                                <h5 className='mt-1'>Price: <span className='text-lg text-[#FFD700]'>{item.price * (item.quantity + dayDifference)} €</span></h5>

                            </div><div className="w-full flex justify-center mt-4">
                                <button color="primary" className='p-2 hover:bg-danger-200 text-white font-bold rounded-full transition-colors duration-200' onClick={() => removeFromBasket(index)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 16 16">
                                        <circle cx="8" cy="8" r="8" fill="#fe3155"></circle>
                                        <polygon fill="#fff" points="11.536,10.121 9.414,8 11.536,5.879 10.121,4.464 8,6.586 5.879,4.464 4.464,5.879 6.586,8 4.464,10.121 5.879,11.536 8,9.414 10.121,11.536"></polygon>
                                    </svg>
                                </button>

                            </div>

                        </motion.div>

                    );
                })}
            </div>

            {/* Display total price */}
            <div className="total-price mt-4 p-4 border-t-4 border-teal-900/50 bg-teal-800/50 rounded">
                <div className="w-full flex justify-center mt-4">

                    <h2 className="price"><span className="text-white-500/50 text-xl shadow rounded p-2 bg-gray-900/50 border-1 border-white-500/50">{calculateTotalPrice(basket)} €</span></h2>
                </div>

            </div>
            {renderCheckoutButton()}
            {renderExtendedView()}




        </motion.div>
    );
};

export default BasketComponent;
