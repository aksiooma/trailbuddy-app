// components/BikeDetail.tsx
import React from 'react';
import { BikeDetailProps } from './Types/types'
import { motion } from 'framer-motion';


const BikeDetail: React.FC<BikeDetailProps & { onClose: () => void }> = ({ bike, onClose }) => {
    return (
        <motion.div className="p-6 border border-gray-300 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}>
            <motion.div className='flex justify-between items-center' initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}>

                <h3 className="text-2xl font-semibold mb-3">{bike.name}</h3>
                <button onClick={onClose} className="close-btn"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </motion.div>
            <img className='img rounded' src={bike.image} />
            <p className="mt-1 text-base text-white-800 mt-3">{bike.desc}</p>

        </motion.div>
    );
};

export default BikeDetail;
