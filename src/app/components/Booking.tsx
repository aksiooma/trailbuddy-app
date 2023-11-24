import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DatePicker from './DatePicker';
import { Bike } from './Types/types';
import { runTransaction, doc, onSnapshot, collection, where, query, serverTimestamp, deleteDoc, getDocs, Timestamp, DocumentData, QuerySnapshot } from "firebase/firestore"
import db from "./FirestoreInit"
import { motion } from 'framer-motion';
import { AvailabilityData } from './Types/types';
import { User } from "firebase/auth";


// Define the props expected by BookingFlow
interface BookingFlowProps {
    selectedBike: Bike | null; // Allow selectedBike to be null
    user: User | null;
    onLogout: () => void;
}


// Define the structure for a reservation item
interface ReservationItem {
    bikeId: string;
    name: string;
    quantity: number;
    startDate: Date;
    endDate: Date | null; // Allow endDate to be null
    reservationId?: string; // ID of the reservation document
    price: number;
}


interface Reservation {
    id: any;
    bikeId: string;
    startDate: Timestamp;
    endDate: Timestamp;
    quantity: number;

}

const BookingFlow: React.FC<BookingFlowProps> = ({ selectedBike, user, onLogout }) => {

    const [availableBikes, setAvailableBikes] = useState<Bike[]>([]);
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [basket, setBasket] = useState<ReservationItem[]>([]);
    const [selectedBikeAvailableStock, setSelectedBikeAvailableStock] = useState<number>(0);
    const [dateAvailability, setDateAvailability] = useState<AvailabilityData>({});

    const [allReservations, setAllReservations] = useState<Reservation[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const isAddToBasketDisabled = !startDate || selectedQuantity <= 0 || selectedBikeAvailableStock <= 0 || isAdding;

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

    useEffect(() => {
        // Fetch all the bikes only once on component mount
        const fetchBikes = async () => {
            const bikesSnapshot = await getDocs(collection(db, "bikes"));
            const bikesData = bikesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bike));
            setAvailableBikes(bikesData);
        };
        fetchBikes();
    }, []);


    useEffect(() => {
        if (selectedBike) {
            setSelectedBikeAvailableStock(selectedBike.stock);
        } else {
            // Handle the case when no bike is selected
            setSelectedBikeAvailableStock(0); // or another appropriate default value
        }
    }, [selectedBike]);


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
        let processedDates: Record<string, boolean> = {};
        const startDateRange = new Date();
        startDateRange.setHours(0, 0, 0, 0); // Set to start of today
        const endDateRange = new Date(startDateRange);
        endDateRange.setDate(endDateRange.getDate() + 120); // Next 120 days

        const allDatesInRange = generateDateRange(startDateRange, endDateRange);

        // Initialize availability for each bike and each date
        allDatesInRange.forEach(dateString => {
            newAvailabilityData[dateString] = {};
            availableBikes.forEach(bike => {
                newAvailabilityData[dateString][bike.id] = bike.stock;
            });
        });

        // Adjust availability based on filtered Firestore reservations
        // Handle reservations from Firestore
        allReservations.forEach(reservation => {
            const reservationDates = generateDateRange(
                new Date(reservation.startDate.toDate()),
                new Date(reservation.endDate.toDate())
            );

            reservationDates.forEach(dateString => {
                // Process reservation dates
                if (newAvailabilityData[dateString]?.[reservation.bikeId]) {
                    newAvailabilityData[dateString][reservation.bikeId] -= reservation.quantity;
                }
                processedDates[dateString] = true; // Mark date as processed
            });
        });

        // Handle basket items separately
        basket.forEach(item => {
            const basketItemDates = generateDateRange(item.startDate, item.endDate || item.startDate);

            basketItemDates.forEach(dateString => {
                // Only process if the date hasn't been processed yet
                if (!processedDates[dateString] && newAvailabilityData[dateString]?.[item.bikeId]) {
                    newAvailabilityData[dateString][item.bikeId] = Math.max(0, newAvailabilityData[dateString][item.bikeId] - item.quantity);
                }
            });
        });

        setDateAvailability(newAvailabilityData);
    }, [allReservations, availableBikes, basket]);

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
        if (isAddToBasketDisabled) return; // Check if button should be disabled
        setIsAdding(true); // Disable further actions

        if (!selectedBike || !startDate || selectedQuantity <= 0) {
            console.error("No bike selected, date not chosen, or invalid quantity.");
            return;
        }

        if (selectedQuantity > selectedBikeAvailableStock) {
            console.error("Not enough stock available");
            return;
        }

        try {
            const reservationRef = doc(collection(db, "reservations"));
            await runTransaction(db, async (transaction) => {
                transaction.set(reservationRef, {
                    bikeId: selectedBike.id,
                    name: selectedBike.name,
                    quantity: selectedQuantity,
                    startDate: startDate,
                    endDate: endDate || startDate,
                    status: 'pending',
                    createdAt: serverTimestamp()
                });
            });

            const newBasketItem = {
                bikeId: selectedBike.id,
                name: selectedBike.name,
                quantity: selectedQuantity,
                startDate: startDate,
                endDate: endDate || startDate,
                reservationId: reservationRef.id,
                price: selectedBike.price
            };

            setBasket(prevBasket => [...prevBasket, newBasketItem]);

        } catch (e) {
            console.error("Transaction failed: ", e);
        }
        setTimeout(() => {
            setIsAdding(false);
        }, 1000); // Delay of 1 second
    };

    // This function removes an item from the basket and updates Firestore.
    const removeFromBasket = async (index: number) => {
        const itemToRemove = basket[index];
        if (itemToRemove.reservationId) {
            await deleteDoc(doc(db, "reservations", itemToRemove.reservationId));
        }

        const newBasket = basket.filter((_, i) => i !== index);
        setBasket(newBasket);

        // Update local storage with the new basket
        if (user) {
            const userBasketKey = `basket_${user.uid}`;
            localStorage.setItem(userBasketKey, JSON.stringify(newBasket));
        }

    };


    // Load basket from local storage on user change
    useEffect(() => {
        if (user) {
            const userBasketKey = `basket_${user.uid}`;
            const savedBasketData = localStorage.getItem(userBasketKey);
            if (savedBasketData) {
                const { items, timestamp } = JSON.parse(savedBasketData);
                const currentTime = new Date().getTime();
                if (currentTime - timestamp < 15 * 60 * 1000) { // 15 minutes
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

    function calculateDayDifference(startDate: { getTime: () => number; }, endDate: { getTime: () => number; }) {
        const msPerDay = 24 * 60 * 60 * 1000;
        const diffInMs = endDate.getTime() - startDate.getTime();
        return Math.round(diffInMs / msPerDay);
    }



    // Update selectedQuantity when available stock changes
useEffect(() => {
    if (!selectedBike || !startDate) {
        return;
    }

    const dateString = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const currentAvailableStock = dateAvailability[dateString]?.[selectedBike.id] ?? selectedBike.stock;

    if (selectedQuantity > currentAvailableStock || selectedQuantity === 0) {
        setSelectedQuantity(currentAvailableStock > 0 ? 1 : 0); // Set to 1 if stock is available, otherwise 0
    }
}, [dateAvailability, selectedBike, startDate, selectedQuantity]);

const renderQuantitySelector = () => {
    if (!selectedBike || !startDate) {
        return null;
    }

    const dateString = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const availableStock = dateAvailability[dateString]?.[selectedBike.id] ?? selectedBike.stock;

    if (availableStock === 0) {
        return <p className="text-red-500">Fully Booked</p>;
    }

    const options = [];
    for (let i = 1; i <= availableStock; i++) {
        options.push(<option key={i} value={i}>{i}</option>);
    }

    return (
        <div className="flex flex-col">
            <label htmlFor="quantity-selector" className="text-lg font-medium">Select Quantity:</label>
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
    // Instead of returning null when there's no bike selected,
    // render a message prompting the user to select a bike.
    const renderBookingOrPrompt = () => {
        if (selectedBike) {
            return (
                <motion.div className="booking-flow p-6 border border-gray-200 rounded-lg" initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}>
                    <motion.div className='header flex justify-between items-center'>
                        <h1 className='text-lg'>Make a booking:</h1>
                        <button className="border-2 border-rose-500/50 p-2 mb-5 rounded-full hover:bg-danger-100 border-gray-300 text-white font-bold transition-colors duration-200" onClick={onLogout}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg></button>
                    </motion.div>
                    {selectedBike && (
                        <motion.div className="bookingForm flex flex-col justify-between items-center space-y-4 p-6 border border-gray-300 rounded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}>

                            <div className="date"><label className='rounded-lg'>Select Date: </label>
                                {selectedBike && (
                                    <DatePicker
                                        startDate={startDate}
                                        endDate={endDate}
                                        setStartDate={setStartDate}
                                        setEndDate={setEndDate}
                                        availabilityData={dateAvailability}
                                        selectedBike={selectedBike} // Pass the selected bike
                                    />
                                )}

                            </div>

                            {renderQuantitySelector()}
                            <button color="primary" disabled={isAddToBasketDisabled}
                                className={`bg-teal-500/50 border-2 border-white-500/50 hover:bg-blue-900/50 text-white font-bold rounded-full transition-colors duration-200 p-2 mx-5 w-full ${isAddToBasketDisabled ? 'bg-gray-500 hover:bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-green-700'
                                    }`} onClick={addToBasket}>Add to Basket</button>
                        </motion.div>
                    )}
                    <motion.div className="basket p-5 border-4 border-teal-700/50 rounded-lg mt-5 bg-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}>
                        {basket.map((item, index) => {
                            // Convert strings to Date objects
                            const startDate = new Date(item.startDate);
                            const endDate = item.endDate ? new Date(item.endDate) : startDate;
                            // Calculate day difference
                            const dayDifference = calculateDayDifference(startDate, endDate);
                            return (

                                <motion.div className='p-4 border-2 border-teal-400/50 rounded-lg bg-black flex flex-col justify-between items-start' key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}>
                                    <h1 className='text-lg '>{item.name}</h1> <hr></hr><h3>Date:
                                        <span className='text-lg text-teal-400/50'> {item.startDate.toLocaleDateString('en-GB')}
                                            {item.endDate ? ` - ${item.endDate.toLocaleDateString('en-GB')}` : ''}</span></h3>
                                    <h2>Quantity: <span className='text-lg text-teal-400/50'>{item.quantity}</span></h2>
                                    <hr></hr>
                                    <h4 className='mt-1'>Price: <span className='text-lg text-teal-500/50'>{item.price * (item.quantity + dayDifference)} €</span></h4>
                                    <div className="w-full flex justify-center mt-4">
                                        <button color="primary" className='p-2 hover:bg-danger-200 text-white font-bold rounded-full transition-colors duration-200' onClick={() => removeFromBasket(index)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 16 16">
                                                <circle cx="8" cy="8" r="8" fill="#fe3155"></circle>
                                                <polygon fill="#fff" points="11.536,10.121 9.414,8 11.536,5.879 10.121,4.464 8,6.586 5.879,4.464 4.464,5.879 6.586,8 4.464,10.121 5.879,11.536 8,9.414 10.121,11.536"></polygon>
                                            </svg>
                                        </button>
                                    </div></motion.div>

                            );
                        })}
                    </motion.div>
                </motion.div>
            );
        } else {
            return (
                <motion.div className='mt-2 text-xl p-6 border-2 border-teal-500/50 rounded-lg mt-5' initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}>Please select a bike to continue</motion.div>
            );
        }
    };

    return (
        <motion.div className="booking-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}>
            {renderBookingOrPrompt()}
            {/* Render the blank basket regardless of whether a bike is selected */}
            <motion.div className="basket" initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}>
                {/* ... render items in the basket ... */}
            </motion.div>
        </motion.div>
    );
};

export default BookingFlow;
