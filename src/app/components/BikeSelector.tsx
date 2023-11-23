import React, { useEffect, useState } from 'react';
import db from './FirestoreInit'; // Adjust the path as needed
import { collection, getDocs } from 'firebase/firestore';
import {Bike, BikeSelectorProps} from './Types/types'

const BikeSelector: React.FC<BikeSelectorProps> = ({ onSelectBike, selectedBike }) => {
    const [bikes, setBikes] = useState<Bike[]>([]);

    useEffect(() => {
        const fetchBikes = async () => {
            const bikesCollection = collection(db, 'bikes');
            const bikeSnapshot = await getDocs(bikesCollection);
            const bikeList: Bike[] = bikeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bike));
            setBikes(bikeList);
        };

        fetchBikes();
    }, []);

    return (
        <div className="p-6 border border-gray-200 rounded-lg">
            <h1 className="text-xl font-large mb-4 text-green-700">Select your Bike:</h1>
            <ul className='text-lg font-medium'>
                {bikes.map(bike => (
                    <li
                        key={bike.id}
                        className={`cursor-pointer p-3 mt-2 mb-2 border-1 border-teal-100/50 rounded hover:border-teal-700/50 ${bike.stock === 0 ? 'text-gray-500' : ''} ${selectedBike?.id === bike.id ? 'text-[#FFD700]' : ''} py-2 focus:outline-none hover:text-teal-500/50 transition-colors duration-200`}
                        onClick={() => onSelectBike(bike)}
                    >
                        {bike.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BikeSelector;


