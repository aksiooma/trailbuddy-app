import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from './DatePicker';
import { Bike, BikeSizeKey, BookingFlowProps, ReservationItem, Reservation } from './Types/types';
import { runTransaction, doc, onSnapshot, collection, serverTimestamp, deleteDoc, getFirestore, getDoc, } from "firebase/firestore"
import { db } from "./FirestoreInit"
import { motion, AnimatePresence } from 'framer-motion';
import { AvailabilityData } from './Types/types';
import BasketComponent from './BasketComponent';
import { useFetchBikes } from './hooks/useFetchBikes';
import RegistrationForm from './RegisterationForm';
import Modal from './RegisterationModal';
import { useLanguage } from '../context/LanguageContext';

const BookingFlow: React.FC<BookingFlowProps> = ({ handleAccessoryToggle, selectedBike, user, onLogout, selectedSize, accessories, selectedAccessories, setSelectedAccessories, isProfileComplete, setIsProfileComplete, setRegistrationModalOpen, setIsRegistrationCompleted, isRegistrationCompleted, startDate, endDate, selectedBikeAvailableStock, dateAvailability, setSelectedBikeAvailableStock, setDateAvailability, setStartDate, setEndDate, datePickerRef }) => {
    const { t } = useLanguage();
    const availableBikes = useFetchBikes();
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
    const [basket, setBasket] = useState<ReservationItem[]>([]);
    const [allReservations, setAllReservations] = useState<Reservation[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showDatepicker, setShowDatepicker] = useState(true);
    const [isExtendedViewVisible, setIsExtendedViewVisible] = useState(false);
    const [loginMethod, setLoginMethod] = useState('');


    useEffect(() => {
        // Retrieve login method from localStorage
        const storedLoginMethod = localStorage.getItem('loginMethod');
        if (storedLoginMethod) {
            setLoginMethod(storedLoginMethod);
        }
    }, []);



    useEffect(() => {
        // Real-time listener for reservations
        const unsubscribe = onSnapshot(collection(db, "reservations"), (snapshot) => {
            const updatedReservations = snapshot.docs.map(doc => ({
                ...doc.data() as Reservation,
                id: doc.id
            }));
            setAllReservations(updatedReservations);

        });

        return () => unsubscribe(); // Cleanup function to unsubscribe on unmount
    }, []);


    const getStockBySelectedSize = (bike: Bike | null, selectedSize: BikeSizeKey | null): number => {
        if (!bike || !selectedSize) return 0;

        return bike[selectedSize] || 0; // Use type assertion
    }

    useEffect(() => {
        if (selectedBike && selectedSize) {

            setSelectedBikeAvailableStock(getStockBySelectedSize(selectedBike, selectedSize));
        } else {
            // Handle the case when no bike is selected
            setSelectedBikeAvailableStock(0);
        }
    }, [selectedBike, selectedSize, setSelectedBikeAvailableStock]);


    //DateRange for recalculating the availability for datepicker
    function generateDateRange(start: Date, end: Date) {
        let dates = [];
        let currentDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        let adjustedEndDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        while (currentDate <= adjustedEndDate) {
            let formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            dates.push(formattedDate);
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
        }

        return dates;
    }

    const recalculateAvailability = useCallback(() => {
        let newAvailabilityData: AvailabilityData = {};
        const startDateRange = new Date();
        startDateRange.setHours(0, 0, 0, 0);
        const endDateRange = new Date(startDateRange);
        endDateRange.setDate(endDateRange.getDate() + 120);

        const allDatesInRange = generateDateRange(startDateRange, endDateRange);

        // Initialize availability for each bike and each date
        allDatesInRange.forEach(dateString => {
            newAvailabilityData[dateString] = {};
            availableBikes.forEach(bike => {
                newAvailabilityData[dateString][bike.id] = {
                    Small: bike.Small,
                    Medium: bike.Medium,
                    Large: bike.Large
                };
            });
        });

        // Adjust availability based on Firestore reservations only
        allReservations.forEach(reservation => {
            const reservationDates = generateDateRange(
                new Date(reservation.startDate.toDate()),
                new Date(reservation.endDate.toDate())
            );

            reservationDates.forEach(dateString => {
                if (newAvailabilityData[dateString] && reservation.bikeId in newAvailabilityData[dateString]) {
                    const sizeKey = reservation.size;
                    if (sizeKey in newAvailabilityData[dateString][reservation.bikeId]) {
                        newAvailabilityData[dateString][reservation.bikeId][sizeKey] -= reservation.quantity;
                    }
                }
            });
        });

        // Update availability data state
        setDateAvailability(newAvailabilityData);
    }, [allReservations, availableBikes, setDateAvailability]);


    // Debounce function
    function debounce<F extends (...args: any[]) => void>(func: F, waitFor: number): (...args: Parameters<F>) => ReturnType<F> {
        let timeout: ReturnType<typeof setTimeout> | null = null;

        return function (...args: Parameters<F>): ReturnType<F> {
            if (timeout !== null) {
                clearTimeout(timeout);
                timeout = null;
            }
            timeout = setTimeout(() => func(...args), waitFor);
            return undefined as unknown as ReturnType<F>;
        };
    }

    // a debounced version of recalculateAvailability outside of useCallback
    const debouncedRecalculateAvailability = debounce(() => {
        recalculateAvailability();
    }, 500);


    // Recalculate availability when basket or allReservations change
    useEffect(() => {
        debouncedRecalculateAvailability();
    }, [debouncedRecalculateAvailability, basket, allReservations]);



    // This function adds the selected bike to the basket and updates Firestore.
    const addToBasket = async () => {
        if (isAddToBasketDisabled) return;
        setIsAdding(true);

        if (!selectedBike || !startDate || selectedQuantity <= 0) {
            console.error("No bike selected, date not chosen, or invalid quantity.");
            setIsAdding(false);
            return;
        }

        try {
            // Calculate the number of days
            const days = endDate 
                ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                : 1;
            
            const reservationRef = doc(collection(db, "reservations"));
            await runTransaction(db, async (transaction) => {
                transaction.set(reservationRef, {
                    bikeId: selectedBike.id,
                    name: selectedBike.name,
                    quantity: selectedQuantity,
                    startDate: startDate,
                    endDate: endDate || startDate,
                    status: 'pending',
                    createdAt: serverTimestamp(),
                    size: selectedSize,
                    accessories: selectedAccessories,
                    days: days // Add the number of days to Firestore
                });
            });

            const totalPrice = calculateTotalPrice(selectedBike.price || 75, selectedQuantity);

            const newBasketItem = {
                bikeId: selectedBike.id,
                name: selectedBike.name,
                quantity: selectedQuantity,
                startDate: startDate,
                endDate: endDate || startDate,
                reservationId: reservationRef.id,
                price: selectedBike.price || 75, // Store the base price
                totalPrice: totalPrice, // Store the total price
                size: selectedSize,
                accessories: selectedAccessories,
                days: days // Add the number of days to the basket item
            };

            setBasket(prevBasket => [...prevBasket, newBasketItem]);

            // Reset accessories selection after adding to basket
            setSelectedAccessories([]);
        } catch (e) {
            console.error("Transaction failed: ", e);
        } finally {
            setTimeout(() => {
                setIsAdding(false);
            }, 1000);
        }
    };




    // This function removes an item from the basket and updates Firestore.
    const removeFromBasket = async (index: number) => {
        const itemToRemove = basket[index];

        if (itemToRemove.reservationId) {
            try {
                await deleteDoc(doc(db, "reservations", itemToRemove.reservationId));
            } catch (error) {
                console.error("Failed to delete reservation from Firestore: ", error);
            }
        }

        const newBasket = basket.filter((_, i) => i !== index);
        setBasket(newBasket);

        if (user) {
            const userBasketKey = `basket_${user.uid}`;
            localStorage.setItem(userBasketKey, JSON.stringify({ items: newBasket, timestamp: new Date().getTime() }));
        }

        // Trigger a recalculation of availability after modifying the basket
        recalculateAvailability();
    };





    // Load basket from local storage on user change
    useEffect(() => {
        if (user) {
            const userBasketKey = `basket_${user.uid}`;
            const savedBasketData = localStorage.getItem(userBasketKey);
            if (savedBasketData) {
                const { items, timestamp } = JSON.parse(savedBasketData);
                const currentTime = new Date().getTime();
                if (currentTime - timestamp < 30 * 60 * 1000) { // 60 minutes
                    const rehydratedBasket = items.map((item: { startDate: string | number | Date; endDate: string | number | Date; }) => ({
                        ...item,
                        startDate: new Date(item.startDate),
                        endDate: item.endDate ? new Date(item.endDate) : null
                    }));
                    setBasket(rehydratedBasket);

                } else {
                    localStorage.removeItem(userBasketKey); // Clear expired basket data
                }
            }
        }
    }, [user]);

    // Save current basket to local storage when basket changes
    useEffect(() => {
        if (user && basket.length > 0) {
            const userBasketKey = `basket_${user.uid}`;
            const basketWithTimestamp = {
                items: basket,
                timestamp: new Date().getTime()
            };
            localStorage.setItem(userBasketKey, JSON.stringify(basketWithTimestamp));
        }
    }, [basket, user]);

    const getMinAvailableQuantityForRange = useCallback((startDate: Date, endDate: Date, selectedBike: Bike, selectedSize: BikeSizeKey) => {
        let minAvailableQuantity = Infinity;

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            const bikeAvailability = dateAvailability[dateString]?.[selectedBike.id];
            if (bikeAvailability) {
                const availableStock = bikeAvailability[selectedSize];
                minAvailableQuantity = Math.min(minAvailableQuantity, availableStock);
            }

            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
        }
        return minAvailableQuantity;
    }, [dateAvailability]); // Include all the dependencies the function relies on


    // Update selectedQuantity when available stock changes
    useEffect(() => {
        if (!selectedBike || !startDate || !selectedSize) {
            return;
        }

        let currentAvailableStock = 0;
        if (endDate && startDate < endDate) {
            // For a range of dates, find the minimum available stock in that range
            currentAvailableStock = getMinAvailableQuantityForRange(startDate, endDate, selectedBike, selectedSize as BikeSizeKey);
        } else {
            // For a single day, get the stock for that specific day
            const dateString = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
            const dayStock = dateAvailability[dateString]?.[selectedBike.id];
            if (dayStock !== undefined && selectedSize in dayStock) {
                // Accessing the stock based on the selected size
                currentAvailableStock = dayStock[selectedSize];
            } else {
                // Fallback to default stock based on size if no specific availability data found
                currentAvailableStock = getStockBySelectedSize(selectedBike, selectedSize);
            }
        }

        if (selectedQuantity > currentAvailableStock || selectedQuantity === 0) {
            setSelectedQuantity(currentAvailableStock > 0 ? 1 : 0);
        }
    }, [dateAvailability, selectedBike, startDate, endDate, selectedQuantity, selectedSize, getMinAvailableQuantityForRange]);



    const renderQuantitySelector = () => {
        if (!selectedBike || !startDate || !selectedSize) {
            return null;
        }
        let availableStock: number = 0;
        if (endDate && startDate < endDate) {
            availableStock = getMinAvailableQuantityForRange(startDate, endDate, selectedBike, selectedSize);
        } else {
            const dateString = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
            const bikeAvailability = dateAvailability[dateString]?.[selectedBike.id];
            if (bikeAvailability) {
                availableStock = bikeAvailability[selectedSize];
            }
        }

        // If no bikes are available, show a message instead of the selector
        if (availableStock === 0) {
            return <p className="text-red-500">Fully Booked</p>;
        }

        const options = [];
        for (let i = 1; i <= availableStock; i++) {
            options.push(<option key={i} value={i}>{i}</option>);
        }

        return (
            <div className="flex flex-col">
                <label htmlFor="quantity-selector" className="text-lg font-medium">{t('booking.selectQuantity')}</label>
                <select
                    id="quantity-selector"
                    className='rounded-lg p-1 mt-2 mb-2 text-xl dark text-foreground border-1 border-white-500/50'
                    value={selectedQuantity}
                    onChange={e => setSelectedQuantity(Number(e.target.value))}
                    aria-label="Select Quantity"
                >
                    {options}
                </select>
            </div>
        );
    };

    useEffect(() => {
        const checkUserProfile = async () => {
            if (user && loginMethod === "Google") {
                const firestore = getFirestore();
                const userDoc = doc(firestore, "USERS", user.uid);

                const docSnapshot = await getDoc(userDoc);
                if (!docSnapshot.exists()) {
                    // Profile is incomplete
                    setIsProfileComplete(false);
                    setRegistrationModalOpen(true);
                } else {
                    // Profile is complete
                    setIsProfileComplete(true);
                }
            }
        };

        checkUserProfile();
    }, [user, loginMethod, setIsProfileComplete, setRegistrationModalOpen]);


    const handleCheckoutClick = () => {
        setShowConfirmation(true);
    };

    const handleProceedToCheckout = () => {
        setIsExtendedViewVisible(true);
        setShowDatepicker(false);
    };

    useEffect(() => {
        if (basket.length === 0) {
            setIsExtendedViewVisible(false); // Hide extended view when basket is empty
        }
    }, [basket.length, setIsExtendedViewVisible]);

    // Calculate total price including accessories
    const calculateTotalPrice = (basePrice: number, quantity: number): number => {
        // Tarkistetaan, että startDate ei ole null
        if (!startDate) return basePrice * quantity;
        
        // Calculate the number of days
        const days = endDate 
            ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
            : 1;
        
        // Calculate the total price of accessories
        const accessoriesTotal = selectedAccessories.reduce((total: number, accessoryId: string) => {
            const accessory = accessories.find(a => a.id === accessoryId);
            return total + (accessory ? accessory.price : 0);
        }, 0);

        // Total price = (bike base price * number of days + accessories price) * quantity
        return ((basePrice * days) + accessoriesTotal) * quantity;
    };



    // Render accessories selector
    const renderAccessoriesSelector = () => {
        if (!selectedBike || !startDate || !selectedSize) {
            return null;
        }

        // Calculate the number of days
        const days = endDate 
            ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
            : 1;
        
        const basePrice = selectedBike.price || 75;
        const basePriceTotal = basePrice * days;

        return (
            <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-3">{t('booking.selectAccessories')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {accessories?.map((accessory: { id: string; name: string; price: number }) => (
                        <div
                            key={accessory.id}
                            onClick={() => handleAccessoryToggle(accessory.id)}
                            className={`
                                p-4 rounded-lg border cursor-pointer transition-all duration-200 flex items-center
                                ${selectedAccessories.includes(accessory.id)
                                    ? 'border-teal-500 bg-teal-900/20'
                                    : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800'}
                            `}
                        >
                            <div className={`
                                w-5 h-5 rounded border mr-3 flex items-center justify-center
                                ${selectedAccessories.includes(accessory.id)
                                    ? 'bg-teal-500 border-teal-600'
                                    : 'border-zinc-600'}
                            `}>
                                {selectedAccessories.includes(accessory.id) && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>

                            <div className="flex-1">
                                <span className="text-white">{accessory.name}</span>
                            </div>

                            <div>
                                <span className="text-teal-400 font-medium">{accessory.price}€</span>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedAccessories.length > 0 || days > 1 ? (
                    <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-400">{t('booking.basePrice')}:</span>
                            <span className="text-white">{basePrice}€</span>
                        </div>
                        
                        {days > 1 && (
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-zinc-400">{t('booking.days')}:</span>
                                <span className="text-white">{days}</span>
                            </div>
                        )}
                        
                        {days > 1 && (
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-zinc-400">{t('booking.basePriceTotal')}:</span>
                                <span className="text-white">{basePriceTotal}€</span>
                            </div>
                        )}
                        
                        {selectedAccessories
                            .map((accessoryId) => accessories.find(a => a.id === accessoryId))
                            .filter((accessory): accessory is { id: string; name: string; price: number } => Boolean(accessory))
                            .map((accessory) => (
                                <div key={accessory.id} className="flex justify-between items-center mt-1">
                                    <span className="text-zinc-400">+ {accessory.name}:</span>
                                    <span className="text-teal-400">{accessory.price}€</span>
                                </div>
                            ))}
                        
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-700">
                            <span className="text-white font-medium">{t('booking.totalPrice')}:</span>
                            <span className="text-teal-400 font-bold">
                                {calculateTotalPrice(selectedBike?.price || 75, selectedQuantity)}€
                            </span>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    };

    // Instead of returning null when there's no bike selected,
    // render a message prompting the user to select a bike.
    const renderBookingOrPrompt = () => {

        if (user && loginMethod === "Google" && !isProfileComplete) {
            // Continue showing the registration form modal
            return (
                <Modal isOpen={!isProfileComplete} onClose={() => { }} loginMethod={loginMethod}>
                    <RegistrationForm 
                        registrationUserData={{ user: user, token: undefined }} 
                        setIsProfileComplete={setIsProfileComplete} 
                        loginMethod={loginMethod} 
                        isOpen={!isProfileComplete}
                        setIsRegistrationCompleted={setIsRegistrationCompleted} 
                        onClose={() => setRegistrationModalOpen(false)} 
                    />
                </Modal>
            );
        }

        if (selectedBike && selectedSize) {
            return (
                <motion.div
                    className="bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 shadow-xl overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="p-6 border-b border-zinc-800">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-white">{t('booking.makeReservation')}</h2>
                            <button
                                onClick={onLogout}
                                className="p-2 rounded-full bg-rose-900/20 border border-rose-800/50 text-rose-400 hover:bg-rose-800/30 transition-colors"
                                aria-label="Logout"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="space-y-6">
                          
                                <h3 className="text-lg font-medium text-white mb-4">{t('booking.selectDates')}</h3>
                                {selectedBike && (
                                    <DatePicker
                                        startDate={startDate}
                                        endDate={endDate}
                                        setStartDate={setStartDate}
                                        setEndDate={setEndDate}
                                        availabilityData={dateAvailability}
                                        selectedBike={selectedBike}
                                        selectedSize={selectedSize}
                                    />
                                )}
                            

                            {startDate && (
                                <AnimatePresence>
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="bg-zinc-800/30 rounded-lg p-5 border border-zinc-700">
                                            {renderQuantitySelector()}
                                            {renderAccessoriesSelector()}
                                        </div>

                                        <div className="mt-6">
                                            <button
                                                disabled={isAddToBasketDisabled}
                                                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center
                                                    ${isAddToBasketDisabled
                                                        ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-lg'
                                                    }`}
                                                onClick={addToBasket}
                                            >
                                                {isAdding ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        {t('booking.adding')}
                                                    </>
                                                ) : t('booking.addToBasket')}
                                            </button>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </div>
                    </div>

                    {/* BasketComponent */}
                    <BasketComponent
                        basket={basket}
                        db={db}
                        removeFromBasket={removeFromBasket}
                        onCheckoutClick={handleCheckoutClick}
                        onHandleCheckout={handleProceedToCheckout}
                        user={user}
                        IsExtendedViewVisible={isExtendedViewVisible}
                        showConfirmation={showConfirmation}
                        showDatepicker={showDatepicker}
                        loginMethod={loginMethod}
                        setBasket={setBasket}
                        setIsRegistrationCompleted={setIsRegistrationCompleted}
                        isRegistrationCompleted={isRegistrationCompleted}
                    />
                </motion.div>
            );
        } else {
            // Render the prompt based on whether a bike is selected or not
            const promptMessage = selectedBike ? t('booking.selectSizeToContinue') : t('booking.selectBikeToContinue');

            return (
                <motion.div
                    className="bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 shadow-xl p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-teal-500/20 p-3 rounded-full mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-xl font-medium text-white">{promptMessage}</div>
                        </div>

                        <button
                            onClick={onLogout}
                            className="p-2 rounded-full bg-rose-900/20 border border-rose-800/50 text-rose-400 hover:bg-rose-800/30 transition-colors"
                            aria-label="Logout"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                        </button>
                    </div>
                </motion.div>
            );
        }
    };

    const isAddToBasketDisabled = !startDate || selectedQuantity <= 0 || selectedBikeAvailableStock <= 0 || isAdding || !selectedBike || !selectedSize;

    return (
        <div>
            {renderBookingOrPrompt()}
        </div>
    );
};

export default BookingFlow;
