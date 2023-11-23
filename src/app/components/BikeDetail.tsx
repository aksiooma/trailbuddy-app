// components/BikeDetail.tsx
import React from 'react';
import { BikeDetailProps } from './Types/types'
import { motion } from 'framer-motion';
import Image from 'next/image';
import {commonImageProps} from './Types/types'
import BikeDetailAccordion from './BikeDetailAccordion';


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
                <button onClick={onClose} className="close-btn focus:outline-none hover:text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </motion.div>
            
            {bike.image && <Image className='img rounded'  {...commonImageProps} src={bike.image} alt={bike.name}/>}
            <div className='p-2 mt-2 mb-2 border-1 border-teal-100/50 rounded'>{bike.price} € / day</div>
           <BikeDetailAccordion bike={bike} />
          

        </motion.div>
    );
};

export default BikeDetail;
