import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from './DatePicker';
import { Bike } from './Types/types';
import { runTransaction, doc, onSnapshot, collection, where, query, serverTimestamp, deleteDoc, getDocs, Timestamp, DocumentData, QuerySnapshot } from "firebase/firestore"
import db from "./FirestoreInit"
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
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
    const [isLoading, setIsLoading] = useState(true);
    const [allReservations, setAllReservations] = useState<Reservation[]>([]);
    const isAddToBasketDisabled = !startDate || selectedQuantity <= 0 || selectedBikeAvailableStock <= 0;


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
        }
    }, [selectedBike]);


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

    //DateRange for recalculating the availability for datepicker
    function generateDateRange(start: Date, end: Date) {
        let dates = [];
        let currentDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());

        while (currentDate <= end) {
            let formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            dates.push(formattedDate);
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
        }

        return dates;
    }

    const listenToReservationsForBikeAndDateRange = (bikeId: string, start: Date, end: Date) => {
        const startTimestamp = Timestamp.fromDate(start);
        const endTimestamp = Timestamp.fromDate(end);
       

        const startQuery = query(
            collection(db, 'reservations'),
            where('bikeId', '==', bikeId),
            where('startDate', '<=', endTimestamp)
        );

        const endQuery = query(
            collection(db, 'reservations'),
            where('bikeId', '==', bikeId),
            where('endDate', '>=', startTimestamp)
        );


        const startListener = onSnapshot(startQuery, (snapshot) => {
            processReservationSnapshot(snapshot, bikeId);
        });

        const endListener = onSnapshot(endQuery, (snapshot) => {
            processReservationSnapshot(snapshot, bikeId);
        });

        return () => {
            startListener(); // Unsubscribing from the listener
            endListener();
        };
    };

    const processReservationSnapshot = (snapshot: QuerySnapshot, bikeId: string) => {
        let newReservations = snapshot.docs.map(doc => ({ ...doc.data() as Reservation, id: doc.id }));

        const deduplicatedReservations = mergeAndDeduplicateReservations(newReservations, allReservations);
        setAllReservations(deduplicatedReservations);
        recalculateAvailability();
    };

    const mergeAndDeduplicateReservations = (newReservations: Reservation[], existingReservations: Reservation[]) => {
      ;

        const merged = [...existingReservations, ...newReservations];
      
        const deduplicated = merged.reduce((acc, current) => {
          
            // Check if there's an existing item with the same bikeId, startDate, and endDate
            if (!acc.some(item =>
                item.bikeId === current.bikeId &&
                item.startDate.seconds === current.startDate.seconds &&
                item.endDate.seconds === current.endDate.seconds)) {
               
                acc.push(current);
            } else {
               
            }
            return acc;
        }, [] as Reservation[]);

        return deduplicated;
    };


    


    const recalculateAvailability = useCallback(() => {
        let newAvailabilityData: AvailabilityData = {};
        const startDateRange = new Date();
        startDateRange.setHours(0, 0, 0, 0);
        const endDateRange = new Date(startDateRange);
        endDateRange.setDate(endDateRange.getDate() + 30);

        const allDatesInRange = generateDateRange(startDateRange, endDateRange);

        // Initialize availability for each bike and each date
        allDatesInRange.forEach(dateString => {
            newAvailabilityData[dateString] = {};
            availableBikes.forEach(bike => {
                newAvailabilityData[dateString][bike.id] = bike.stock;
            });
        });

        // Adjust availability based on Firestore reservations
        allReservations.forEach(reservation => {
            const reservationDates = generateDateRange(
                new Date(reservation.startDate.toDate()),
                new Date(reservation.endDate.toDate())
            );

            reservationDates.forEach(dateString => {
                if (newAvailabilityData[dateString]?.[reservation.bikeId]) {
                    newAvailabilityData[dateString][reservation.bikeId] = Math.max(0, newAvailabilityData[dateString][reservation.bikeId] - reservation.quantity);
                }
            });
        });


        setDateAvailability(newAvailabilityData);
    }, [allReservations, availableBikes]);






    useEffect(() => {
        if (!selectedBike || !startDate || !endDate) return;

        //  unsubscribe function
        const unsubscribe = listenToReservationsForBikeAndDateRange(selectedBike.id, startDate, endDate);

        return () => unsubscribe(); // Cleanup listener on unmount or dependency change
    }, [selectedBike, startDate, endDate, listenToReservationsForBikeAndDateRange]);


    // fetchReservations defined outside of useEffect
    const fetchReservations = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "reservations"));
            const reservations = querySnapshot.docs.map(doc => ({
                ...doc.data() as Reservation,
                id: doc.id
            }));

            setAllReservations(reservations);
        } catch (error) {
            console.error("Error fetching reservations: ", error);
        }
        setIsLoading(false);
    };

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



    // a debounced version of recalculateAvailability
    const debouncedRecalculateAvailability = useCallback(
        
        debounce(() => {
            recalculateAvailability();
        }, 500),
        // all dependencies that trigger a recalculation
        [recalculateAvailability]
    );


    // Use the debounced function in useEffect
    useEffect(() => {
        debouncedRecalculateAvailability();
    }, [debouncedRecalculateAvailability]);


    const handleFetchReservations = useCallback(async () => {
        setIsLoading(true);
        setIsLoading(false);
    }, []); // Empty dependency array as fetchReservations should be defined outside


    useEffect(() => {
        handleFetchReservations();
    }, [handleFetchReservations]);


    // Call fetchReservations only once on component mount
    useEffect(() => {
        fetchReservations();
    }, []);


    // This function adds the selected bike to the basket and updates Firestore.
    const addToBasket = async () => {
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
                reservationId: reservationRef.id
            };

            setBasket(prevBasket => [...prevBasket, newBasketItem]);

        } catch (e) {
            console.error("Transaction failed: ", e);
        }
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


    const renderQuantitySelector = () => {
        if (!selectedBike || !startDate) {
            return null;
        }

        // Format date in local time
        const dateString = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
        const availableStock = dateAvailability[dateString]?.[selectedBike.id] ?? selectedBike.stock;


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
                    className='rounded-lg p-1 text-xl dark text-foreground'
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

        if (isLoading) {
            return <div>Loading...</div>; // Render a loading indicator
        }

        if (selectedBike) {
            return (
                <motion.div className="booking-flow p-6 border border-gray-200 rounded-lg" initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}>
                    <motion.div className='header flex justify-between items-center'>
                        <h1 className='text-lg'>Make a booking</h1>
                        <Button className="bg-gray-800 p-2 mb-5 rounded-full hover:bg-danger-100 border text-white font-bold transition-colors duration-200" onClick={onLogout}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg></Button>
                    </motion.div>
                    {selectedBike && (
                        <motion.div className="bookingForm flex flex-col space-y-4 p-6 border border-gray-300 rounded"
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
                            <Button color="primary" disabled={isAddToBasketDisabled}
                                className={`mt-5 text-white font-bold rounded-full transition-colors duration-200 p-2 mx-5 ${isAddToBasketDisabled ? 'bg-gray-500 hover:bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-green-700'
                                    }`} onClick={addToBasket}>Add to Basket</Button>
                        </motion.div>
                    )}
                    <motion.div className="basket p-5 border border-gray-200 rounded-lg mt-5 bg-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}>
                        {basket.map((item, index) => (
                            <motion.div className='flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-black' key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}>
                                {item.name}, <br /> Quantity: {item.quantity}, <br />Date:<br />
                                {item.startDate.toLocaleDateString('en-GB')}
                                {item.endDate ? ` - ${item.endDate.toLocaleDateString('en-GB')}` : ''}
                                <Button color="primary" className='p-2 hover:bg-danger-200 text-white font-bold rounded-full transition-colors duration-200 mx-5' onClick={() => removeFromBasket(index)}><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 16 16">
                                    <circle cx="8" cy="8" r="8" fill="#fe3155"></circle><polygon fill="#fff" points="11.536,10.121 9.414,8 11.536,5.879 10.121,4.464 8,6.586 5.879,4.464 4.464,5.879 6.586,8 4.464,10.121 5.879,11.536 8,9.414 10.121,11.536"></polygon>
                                </svg></Button></motion.div>

                        ))}
                    </motion.div>
                </motion.div>
            );
        } else {
            return (
                <motion.div className='mt-2 text-xl p-6 border border-gray-200 rounded-lg mt-5' initial={{ opacity: 0 }}
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
            {/* Render the basket regardless of whether a bike is selected */}
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
