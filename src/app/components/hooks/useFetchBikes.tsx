import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db }from '../FirestoreInit'; 
import { Bike } from '../Types/types';

export const useFetchBikes = () => {
    const [bikes, setBikes] = useState<Bike[]>([]);

    useEffect(() => {
        const fetchBikes = async () => {
            const bikesCollection = collection(db, 'bikes');
            const bikeSnapshot = await getDocs(bikesCollection);
            const bikeList = bikeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bike));
            setBikes(bikeList);
        };

        fetchBikes();
    }, []);

    return bikes;
};
