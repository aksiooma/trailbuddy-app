// components/BikeDetail.tsx
import React, { useState } from 'react';
import { BikeDetailProps } from './Types/types'
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { commonImageProps } from './Types/types'
import BikeDetailAccordion from './BikeDetailAccordion';
import { useLanguage } from '../context/LanguageContext';

const BikeDetail: React.FC<BikeDetailProps & { onClose: () => void }> = ({ bike, onClose }) => {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <motion.div 
            className="bg-gradient-to-b from-zinc-900 to-zinc-1000 border border-zinc-800 rounded-xl shadow-xl mt-6 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className='flex justify-between items-center p-4 cursor-pointer font-schibsted' onClick={toggleExpand}>
                <h3 className="text-2xl font-semibold text-white font-metrophic">{bike.name}</h3>
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        toggleExpand();
                    }} 
                    className="p-2 rounded-full hover:bg-zinc-800 transition-colors focus:outline-none"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="currentColor" 
                        className={`w-6 h-6 text-zinc-400 hover:text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-6 pt-0">
                            <div className="relative rounded-lg overflow-hidden mb-4 font-schibsted">
                                {bike.image && (
                                    <Image 
                                        src={bike.image} 
                                        alt={bike.name} 
                                        {...commonImageProps}
                                        className="w-full h-auto object-cover rounded-lg"
                                        priority={false} 
                                    />
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-900 to-transparent p-4">
                                    <span className='text-sm text-white font-medium'>{bike.name}</span>
                                    {bike.alt && <span className='text-sm text-zinc-400'>, {bike.alt}</span>}
                                </div>
                            </div>

                            <div className="bg-zinc-800/50 p-4 rounded-lg mb-4 border border-zinc-700">
                                <p className='text-xs text-zinc-400'>
                                    <span className="font-bold text-rose-500">{t('bikeDetail.disclaimerWord')}:</span> {t('bikeDetail.disclaimerText')}
                                </p>
                            </div>

                            <div className='p-4 mb-6 bg-gradient-to-r from-teal-900/30 to-indigo-900/30 rounded-lg border border-teal-800/30 flex justify-between items-center'>
                                <span className="text-white font-medium">{t('bikeDetail.dailyRate')}</span>
                                <span className="text-2xl font-bold text-teal-400">{bike.price} €</span>
                            </div>

                            <BikeDetailAccordion bike={bike} Small={0} Medium={0} Large={0} selectedSize={''} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BikeDetail;
