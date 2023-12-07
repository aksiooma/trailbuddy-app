import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from './DatePicker';
import { Bike, BikeSizeKey } from './Types/types';
import { runTransaction, doc, onSnapshot, collection, serverTimestamp, deleteDoc, Timestamp, } from "firebase/firestore"
import db from "./FirestoreInit"
import { motion } from 'framer-motion';
import { AvailabilityData } from './Types/types';
import { User } from "firebase/auth";
import BasketComponent from './BasketComponent';
import { useFetchBikes } from './hooks/useFetchBikes'; // Adjust the import path as needed


interface BookingFlowProps {
    selectedBike: Bike | null; 
    user: User | null;
    onLogout: () => void;
    selectedSize: BikeSizeKey | null;
    loginMethod: string;

}

interface ReservationItem {
    bikeId: string;
    name: string;
    quantity: number;
    startDate: Date;
    endDate: Date | null;
    reservationId?: string;
    price: number;
    size: BikeSizeKey;
}

interface Reservation {
    id: any;
    bikeId: string;
    startDate: Timestamp;
    endDate: Timestamp;
    quantity: number;
    size: BikeSizeKey;


}

const BookingFlow: React.FC<BookingFlowProps> = ({ selectedBike, user, onLogout, selectedSize }) => {

    const availableBikes = useFetchBikes();
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [basket, setBasket] = useState<ReservationItem[]>([]);

    const [selectedBikeAvailableStock, setSelectedBikeAvailableStock] = useState<number>(0);
    const [dateAvailability, setDateAvailability] = useState<AvailabilityData>({});
    const [allReservations, setAllReservations] = useState<Reservation[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const isAddToBasketDisabled = !startDate || selectedQuantity <= 0 || selectedBikeAvailableStock <= 0 || isAdding || !selectedBike || !selectedSize;

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
    }, [selectedBike, selectedSize]);


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
    }, [allReservations, availableBikes]);


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
                    size: selectedSize
                });
            });

            const newBasketItem = {
                bikeId: selectedBike.id,
                name: selectedBike.name,
                quantity: selectedQuantity,
                startDate: startDate,
                endDate: endDate || startDate,
                reservationId: reservationRef.id,
                price: selectedBike.price,
                size: selectedSize
            };

            setBasket(prevBasket => [...prevBasket, newBasketItem]);
        } catch (e) {
            console.error("Transaction failed: ", e);
        } finally {

            setTimeout(() => {
                setIsAdding(false);
            }, 1000); // Delay of 1 second
        };
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

    // const handleCheckout = () => {
    //     console.log("Booking confirmed");
    //     setIsExtendedViewVisible(false); // Hides the extended view after confirmation
    // };


    // Instead of returning null when there's no bike selected,
    // render a message prompting the user to select a bike.
    const renderBookingOrPrompt = () => {

        if (selectedBike && selectedSize) {
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
                                        selectedSize={selectedSize}

                                    />
                                )}

                            </div>

                            {renderQuantitySelector()}
                            <button color="primary" disabled={isAddToBasketDisabled}
                                className={`bg-teal-500/50 border-2 border-white-500/50 hover:bg-blue-700/50 text-white font-bold rounded-full transition-colors duration-200 py-2 px-5 w-full ${isAddToBasketDisabled ? 'bg-gray-500 hover:bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-teal-700-50'
                                    }`} onClick={addToBasket}>Add to Basket</button>
                        </motion.div>
                    )}
                    {/* Use BasketComponent */}

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
                    />
                    {showConfirmation}

                </motion.div>
            );
        } else {

            // Render the prompt based on whether a bike is selected or not
            const promptMessage = selectedBike ? "Select a size to continue" : "Select a bike to continue";

            return (
                <motion.div className='flex items-center p-6 border-2 border-teal-500/50 rounded-lg' initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}>
                <div className="flex-grow text-xl">{promptMessage}</div>
                <button className="border-2 border-rose-500/50 p-2 rounded-full hover:bg-danger-100 border-gray-300 text-white font-bold transition-colors duration-200" onClick={onLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                </button>
            </motion.div>
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
