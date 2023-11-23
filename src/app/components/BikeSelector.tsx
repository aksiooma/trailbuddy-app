import React, { useEffect, useState } from 'react';
import db from './FirestoreInit'; // Adjust the path as needed
import { collection, getDocs } from 'firebase/firestore';
import {Bike, BikeSelectorProps} from './Types/types'

const BikeSelector: React.FC<BikeSelectorProps> = ({ onSelectBike, selectedBike   }) => {
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
            <h1 className="text-xl font-large mb-3 text-green-700 underline">Select your Bike:</h1>
            <ul className='text-lg font-medium'>
                {bikes.map(bike => (
                    <li
                        key={bike.id}
                        className={`cursor-pointer ${bike.stock === 0 ? 'text-gray-500' : ''} ${selectedBike?.id === bike.id ? 'text-[#FFD700]' : ''} py-2 focus:outline-none hover:text-slate-500`}
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
