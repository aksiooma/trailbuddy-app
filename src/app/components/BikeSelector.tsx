//BikeSelector.tsx
import React from 'react';
import {BikeSelectorProps, BikeSizeKey } from './Types/types'
import { useFetchBikes } from './hooks/useFetchBikes';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

// Kuvan oletusasetukset
const commonImageProps = {
    width: 96,
    height: 96,
};


const BikeSelector: React.FC<BikeSelectorProps> = ({ onSelectBike, selectedBike, onSizeSelect, selectedSize, accessories, selectedAccessories, setSelectedAccessories, getAvailableStockForSize, startDate, datePickerRef, userLoggedIn}) => {
    const bikes = useFetchBikes();
    const { t } = useLanguage();
    

    const scrollToDatePicker = () => {
        if (datePickerRef.current) {
            datePickerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };



    const handleSizeSelect = (size: string) => {
        if (isBikeSizeKey(size)) {
            onSizeSelect(size);
        } else {
            console.error("Invalid bike size selected");
        }
    }
    const handleAccessoryToggle = (accessoryId: string) => {
        setSelectedAccessories((prev: string[]) => {
            if (prev.includes(accessoryId)) {
                return prev.filter(id => id !== accessoryId);
            } else {
                return [...prev, accessoryId];
            }
        });
    };


    const sizes: BikeSizeKey[] = ['Small', 'Medium', 'Large'];

    function isBikeSizeKey(key: string): key is BikeSizeKey {
        return ['Small', 'Medium', 'Large'].includes(key);
    }

    return (
        <div className="space-y-6 font-schibsted">
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-1000 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="p-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bikes.map(bike => (
                            <motion.div
                                key={bike.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSelectBike(bike)}
                                className={`
                                    relative p-4 rounded-lg border cursor-pointer transition-all duration-200
                                    ${selectedBike?.id === bike.id
                                        ? 'border-emerald-500 bg-emerald-900/20'
                                        : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800'}
                                    ${bike.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-24 h-24 bg-zinc-700 rounded-lg overflow-hidden flex-shrink-0">
                                        {bike.image ? (
                                            <Image
                                                src={bike.image}
                                                alt={bike.name}
                                                {...commonImageProps}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className={`font-medium text-lg ${selectedBike?.id === bike.id ? 'text-emerald-400' : 'text-white'}`}>
                                            {bike.name}
                                        </h3>
                                        <p className="text-zinc-400 text-sm">
                                            {'E-MTB'}
                                        </p>
                                        <div className="mt-2">
                                            <span className="text-emerald-400 font-medium">{bike.price || '75'}€{t('bike.perDay')}</span>
                                        </div>
                                        {bike.stock === 0 && (
                                            <span className="text-red-400 text-xs mt-1 block">{t('bike.unavailable')}</span>
                                        )}
                                    </div>
                                </div>

                                {selectedBike?.id === bike.id && (
                                    <div className="absolute -top-2 -right-2">
                                        <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-schibsted text-teal-300 bg-green-800/90">
                                            {t('bike.selected')}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>



            {selectedBike && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-b from-zinc-900 to-zinc-1000 rounded-xl border border-zinc-800 overflow-hidden mt-10"
                >
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-white mb-6">{t('bike.size')}</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {sizes.map(size => {
                                const sizeKey = size as BikeSizeKey;
                                const bikeStock = selectedBike[sizeKey] || 0;
                                const availableFromFunction = getAvailableStockForSize ? getAvailableStockForSize(sizeKey) : 0;
                                console.log(`Size: ${sizeKey}, Bike Stock: ${bikeStock}, Available from function: ${availableFromFunction}`);
                                
                                const availableStock = startDate ? availableFromFunction : bikeStock;
                                
                                return (
                                    <button
                                        key={size}
                                        onClick={() => handleSizeSelect(sizeKey)}
                                        disabled={availableStock === 0}
                                        className={`
                                            px-6 py-3 rounded-lg font-medium transition-all duration-200
                                            ${selectedSize === size
                                                ? 'bg-emerald-600 text-white border-2 border-emerald-500'
                                                : 'bg-zinc-800 text-zinc-300 border-2 border-zinc-700 hover:bg-zinc-700'}
                                            ${availableStock === 0
                                                ? 'opacity-40 cursor-not-allowed'
                                                : 'hover:shadow-lg'}
                                        `}
                                    >
                                        {size}
                                        {availableStock === 0 && (
                                            <span className="text-red-400 text-xs mt-1 block">{t('bike.unavailable')}</span>
                                        )}
                                        {availableStock > 0 && (
                                            <span className="ml-2 text-xs opacity-70 text-teal-200 bg-zinc-800/60 rounded-lg px-2 py-1">
                                                ({availableStock} kpl)
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}

            {selectedBike && selectedSize && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-b from-zinc-900 to-zinc-1000 rounded-xl border border-zinc-800 overflow-hidden mt-10"
                >
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-white mb-6">{t('bike.accessories')}</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {accessories.map(accessory => (
                                <div
                                    key={accessory.id}
                                    onClick={() => handleAccessoryToggle(accessory.id)}
                                    className={`
                                        p-4 rounded-lg border cursor-pointer transition-all duration-200 flex items-center
                                        ${selectedAccessories.includes(accessory.id)
                                            ? 'border-emerald-500 bg-emerald-900/20'
                                            : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800'}
                                    `}
                                >
                                    <div className={`
                                        w-5 h-5 rounded border mr-3 flex items-center justify-center
                                        ${selectedAccessories.includes(accessory.id)
                                            ? 'bg-emerald-500 border-emerald-600'
                                            : 'border-zinc-600'}
                                    `}>
                                        {selectedAccessories.includes(accessory.id) && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <span className="text-white">{accessory.name}</span>
                                    </div>

                                    <div>
                                        <span className="text-emerald-400 font-medium">{accessory.price}€</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {userLoggedIn && (
                <div className="flex justify-center mt-10 md:hidden"> 
                    <button
                        onClick={scrollToDatePicker}
                    className="relative bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 px-6 py-3 rounded-lg text-white font-medium 
                                  transition-all duration-300 flex items-center space-x-2 shadow-xl"
                >
                    <span>{t('bike.continue')}</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default BikeSelector;


