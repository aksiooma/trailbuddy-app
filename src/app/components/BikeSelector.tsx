//BikeSelector.tsx
import React from 'react';
import { Bike, BikeSelectorProps, BikeSizeKey } from './Types/types'
import { useFetchBikes } from './hooks/useFetchBikes';

const BikeSelector: React.FC<BikeSelectorProps> = ({ onSelectBike, selectedBike, onSizeSelect, selectedSize  }) => {
    const bikes = useFetchBikes()
  
    const handleSizeSelect = (size: string) => {
        if (isBikeSizeKey(size)) {
            onSizeSelect(size);
        } else {
            console.error("Invalid bike size selected");
        }
    }

    const sizes: BikeSizeKey[] = ['Small', 'Medium', 'Large'];

    function isBikeSizeKey(key: string): key is BikeSizeKey {
        return ['Small', 'Medium', 'Large'].includes(key);
    }


    const renderSizeButtons = () => {
        if (!selectedBike) return null;

        return (
            <div className="sizes">
                {sizes.map(size => (
                    <button
                        key={size}
                        className={`mt-1 p-2 border-2 border-teal-500/50 rounded-md mr-2 ${selectedSize === size ? 'bg-blue-900/50' : 'bg-teal-900/50'} ${selectedBike[size as keyof Bike] === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleSizeSelect(size)}
                        disabled={selectedBike[size as keyof Bike] === 0}
                    >
                        {size}
                    </button>
                ))}
            </div>
        );
    };


    return (
        <div className="p-6 border border-gray-200 rounded-lg">
            <h1 className="text-xl font-large mb-4 text-teal-500/50">Select your Bike and size:</h1>
            <ul className='text-lg font-medium'>
                {bikes.map(bike => (
                    <li
                        key={bike.id}
                        className={`cursor-pointer p-3 mt-2 mb-2 border-1 border-teal-100/50 rounded hover:border-teal-700/50 ${bike.stock === 0 ? 'text-gray-500' : ''} ${selectedBike?.id === bike.id ? 'text-[#FFD700]' : ''} py-2 focus:outline-none hover:text-teal-500/50 transition-colors duration-200`}
                        onClick={() => {
                            onSelectBike(bike);
                        }}
                    >
                        {bike.name}

                    </li>

                ))}
            </ul>
            {renderSizeButtons()}
        </div>
    );
};

export default BikeSelector;


