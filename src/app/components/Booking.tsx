import React, { useState, useEffect } from 'react';
import DatePicker from './DatePicker';
import { Bike } from './Types/types';
import { runTransaction, doc, onSnapshot, collection, where, query, serverTimestamp, deleteDoc, getDocs, Timestamp } from "firebase/firestore"
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


const BookingFlow: React.FC<BookingFlowProps> = ({ selectedBike, user, onLogout }) => {

    const [availableBikes, setAvailableBikes] = useState<Bike[]>([]);
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [basket, setBasket] = useState<ReservationItem[]>([]);
    const [selectedBikeAvailableStock, setSelectedBikeAvailableStock] = useState<number>(0);
    const [dateAvailability, setDateAvailability] = useState<AvailabilityData>({});

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

    function generateDateRange(start: Date, end: Date) {

        let dates = [];
        let currentDate = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));

        while (currentDate <= end) {
            let formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD in UTC
            dates.push(formattedDate);
            currentDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() + 1));
        }

        return dates;
    }

    useEffect(() => {
        if (selectedBike) {
            setSelectedBikeAvailableStock(selectedBike.stock);
        }
    }, [selectedBike]);

    useEffect(() => {
        if (selectedBike && startDate && endDate) {

            fetchReservationsForBikeAndDateRange(selectedBike.id, startDate, endDate).then(reservations => {


                let availabilityData: AvailabilityData = {};

                const allDatesInRange = generateDateRange(startDate, endDate);
                allDatesInRange.forEach(dateString => {
                    availabilityData[dateString] = selectedBike.stock;
                });

                // Update availability based on combined reservations
                reservations.forEach(({ startDate: resStart, endDate: resEnd, quantity }) => {
                    const startUTC = new Date(Date.UTC(resStart.toDate().getUTCFullYear(), resStart.toDate().getUTCMonth(), resStart.toDate().getUTCDate()));
                    const endUTC = new Date(Date.UTC(resEnd.toDate().getUTCFullYear(), resEnd.toDate().getUTCMonth(), resEnd.toDate().getUTCDate()));
                    const resDatesInRange = generateDateRange(startUTC, endUTC);
                  
                    resDatesInRange.forEach(dateString => {
                        availabilityData[dateString] = Math.max(0, availabilityData[dateString] - quantity);
                    });
                });
                
                setDateAvailability(availabilityData);
            });
        }
    }, [selectedBike, startDate, endDate]); // React to changes in selectedBike, startDate, endDate



    //LocalStorage basket
    useEffect(() => {
        if (user) {
            const userBasketKey = `basket_${user.uid}`; // Unique key for each user
            const savedBasketData = localStorage.getItem(userBasketKey);

            if (savedBasketData) {
                const { items, timestamp } = JSON.parse(savedBasketData);
                const currentTime = new Date().getTime();
                const timeElapsed = currentTime - timestamp;

                // Define the time limit for the basket contents (e.g., 30 minutes)
                const TIME_LIMIT = 30 * 60 * 1000; // 30 minutes in milliseconds

                if (timeElapsed < TIME_LIMIT) {
                    // Rehydrate the basket if within the time limit
                    const rehydratedBasket = items.map((item: { startDate: string | number | Date; endDate: string | number | Date; }) => ({
                        ...item,
                        startDate: new Date(item.startDate),
                        endDate: item.endDate ? new Date(item.endDate) : null
                    }));
                    setBasket(rehydratedBasket);
                } else {
                    // Clear the basket if the time limit has been exceeded
                    setBasket([]);
                    localStorage.removeItem(userBasketKey); // Remove the outdated basket from local storage
                }
            }
        } else {
            setBasket([]); // Clear the basket if no user is logged in
        }
    }, [user]);


    const fetchReservationsForBikeAndDateRange = async (bikeId: string, start: Date, end: Date) => {

        // Convert dates to Firestore Timestamps
        const startTimestamp = Timestamp.fromDate(start);
        const endTimestamp = Timestamp.fromDate(end);

        // Query for reservations starting before or on the end date
        const startQuery = query(
            collection(db, 'reservations'),
            where('bikeId', '==', bikeId),
            where('startDate', '<=', endTimestamp)
        );

        // Query for reservations ending after or on the start date
        const endQuery = query(
            collection(db, 'reservations'),
            where('bikeId', '==', bikeId),
            where('endDate', '>=', startTimestamp)
        );

        try {
            const startQuerySnapshot = await getDocs(startQuery);
            const endQuerySnapshot = await getDocs(endQuery);

            // Combine and filter the results
            let combinedReservations = [...startQuerySnapshot.docs, ...endQuerySnapshot.docs];
            combinedReservations = combinedReservations.filter((doc, index, self) =>
                index === self.findIndex(t => (
                    t.id === doc.id && doc.data().endDate >= start && doc.data().startDate <= end
                ))
            );

            return combinedReservations.map(doc => doc.data());
        } catch (error) {
            console.error("Error fetching reservations: ", error);
            return [];
        }
    };



    // useEffect to update availability
    useEffect(() => {
        const updateAvailabilityOnDateSelection = async () => {
            if (!selectedBike || !startDate || !endDate) return;

            const reservations = await fetchReservationsForBikeAndDateRange(selectedBike.id, startDate, endDate);
            let availability = selectedBike.stock;
            reservations.forEach(reservation => {

                if (reservation.startDate <= endDate && reservation.endDate >= startDate) {
                    availability = Math.min(availability, selectedBike.stock - reservation.quantity);
                }
            });

            setSelectedBikeAvailableStock(availability);
        };

        updateAvailabilityOnDateSelection();
    }, [selectedBike, startDate, endDate, db]);


    const saveBasketToLocal = (basketItems: ReservationItem[]) => {
        const basketWithTimestamp = {
            items: basketItems,
            timestamp: new Date().getTime() // Save the current time as a timestamp
        };
        if (user) {
            localStorage.setItem(`basket_${user.uid}`, JSON.stringify(basketWithTimestamp));
        }
    };



    // This function adds the selected bike to the basket and updates Firestore.
    const addToBasket = async () => {
        if (!selectedBike || !startDate || selectedQuantity <= 0) {
            console.error("No bike selected, date not chosen, or invalid quantity.");
            return;
        }

        // Check if there's enough stock available.
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

            // Update the local basket and available stock state
            const newBasket = [...basket, {
                bikeId: selectedBike.id,
                name: selectedBike.name,
                quantity: selectedQuantity,
                startDate: startDate,
                endDate: endDate || startDate,
                reservationId: reservationRef.id
            }];

            setBasket(newBasket);
            recalculateAvailability();
            saveBasketToLocal(newBasket);
            setSelectedBikeAvailableStock(prevStock => prevStock - selectedQuantity);

            if (user) {
                localStorage.setItem('basket', JSON.stringify(newBasket));
            }

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
        // Update the local basket and available stock state
        const newBasket = basket.filter((_, i) => i !== index);
        setBasket(newBasket);
        recalculateAvailability();
        saveBasketToLocal(newBasket);
        setSelectedBikeAvailableStock(prevStock => prevStock + itemToRemove.quantity);

        if (user) {
            localStorage.setItem('basket', JSON.stringify(newBasket));
        }
    };

    // Listen for changes in the basket and update the available stock
    useEffect(() => {
        if (selectedBike) {
            let availableStock = selectedBike.stock;
            basket.forEach(item => {
                if (item.bikeId === selectedBike.id) {
                    availableStock -= item.quantity;
                }
            });
            setSelectedBikeAvailableStock(availableStock);
        }
    }, [basket, selectedBike]);


    useEffect(() => {
        recalculateAvailability();
    }, [selectedBike, basket]); // Add dependencies as needed


    const recalculateAvailability = async () => {
        if (!selectedBike) return;

        // Initialize availability data with full stock for a range of dates (e.g., the current month)
        let newAvailabilityData: AvailabilityData = {};
        const startDateRange = new Date();
        startDateRange.setHours(0, 0, 0, 0); // Set to the start of the day
        const endDateRange = new Date(); // Ending, for example, 30 days from today
        endDateRange.setDate(endDateRange.getDate() + 30);

        let allDatesInRange = generateDateRange(startDateRange, endDateRange);
        allDatesInRange.forEach(dateString => {
            newAvailabilityData[dateString] = selectedBike.stock;
        });

        // Adjust availability based on reservations from Firestore
        const reservations = await fetchReservationsForBikeAndDateRange(selectedBike.id, startDateRange, endDateRange);
        reservations.forEach(reservation => {
            const reservationDates = generateDateRange(reservation.startDate.toDate(), reservation.endDate.toDate());
            reservationDates.forEach(dateString => {
                newAvailabilityData[dateString] = Math.max(0, newAvailabilityData[dateString] - reservation.quantity);
            });

        });

        // Adjust availability based on current basket items
        basket.forEach(item => {
            if (item.bikeId === selectedBike.id) {
                const basketItemDates = generateDateRange(item.startDate, item.endDate || item.startDate);
                basketItemDates.forEach(dateString => {
                    newAvailabilityData[dateString] = Math.max(0, newAvailabilityData[dateString] - item.quantity);
                });
            }
        });

        setDateAvailability(newAvailabilityData);
    };


    const renderQuantitySelector = () => {
        if (!selectedBike || !startDate) {
            return null;
        }

        const options = [];
        const dateString = startDate.toISOString().split('T')[0];
        const availableStock = dateAvailability[dateString] ?? selectedBike.stock;

        for (let i = 1; i <= availableStock; i++) {
            options.push(<option key={i} value={i}>{i}</option>);
        }

        return (
            <select className='rounded-lg p-1 text-xl dark text-foreground'
                value={selectedQuantity}
                onChange={e => setSelectedQuantity(Number(e.target.value))}>
                {options}
            </select>
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
                    <motion.div className='header flex justify-between items-center-'>
                        <h1 className='text-lg'>Make a booking</h1>
                        <Button className="bg-gray-800 p-2 mb-5 rounded-full hover:bg-danger-100 border text-white font-bold transition-colors duration-200" onClick={onLogout}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg></Button>
                    </motion.div>
                    {selectedBike && (
                        <motion.div className="bookingForm flex flex-col space-y-4 p-6 border border-gray-300 rounded "
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
                            <label className="label">Quantity:</label><span>{renderQuantitySelector()}</span>

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
