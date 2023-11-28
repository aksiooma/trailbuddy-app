import React from 'react';
import { motion } from 'framer-motion';

// Define the type for a basket item
type BasketItem = {
    startDate: Date;
    endDate?: Date | null;
    name: string;
    quantity: number;
    price: number;

};


type Basket = BasketItem[];
type RemoveFromBasketFunction = (index: number) => void;


type BasketComponentProps = {
    basket: Basket;
    removeFromBasket: RemoveFromBasketFunction;
};

//Calculate day difference
function calculateDayDifference(startDate: { getTime: () => number; }, endDate: { getTime: () => number; }) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffInMs = endDate.getTime() - startDate.getTime();
    return Math.round(diffInMs / msPerDay);
}

//Price
const calculateTotalPrice = (basket: any[]) => {
    return basket.reduce((total: number, item: { startDate: string | number | Date; endDate: string | number | Date; price: number; quantity: number; }) => {
        const startDate = new Date(item.startDate);
        const endDate = item.endDate ? new Date(item.endDate) : startDate;
        const dayDifference = calculateDayDifference(startDate, endDate);
        return total + (item.price * (item.quantity + dayDifference));
    }, 0);
};


const BasketComponent: React.FC<BasketComponentProps> = ({ 
    basket, 
    removeFromBasket, 
}) => {
    return (
        <motion.div className="basket p-5 border-4 border-teal-700/50 rounded-lg mt-5 bg-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}>
                        {basket.map((item, index) => {
                            // Convert strings to Date objects
                            const startDate = new Date(item.startDate);
                            const endDate = item.endDate ? new Date(item.endDate) : startDate;
                            // Calculate day difference
                            const dayDifference = calculateDayDifference(startDate, endDate);
                            return (

                                <motion.div className='p-4 border-2 border-teal-300/50 rounded-lg bg-black flex flex-col justify-between items-start' key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}>
                                    <div className='p-2 bg-gray-900/50 border-1 border-white-500/50 rounded'>
                                    <h1 className='text-lg mb-1'>{item.name}</h1> <hr></hr><h3 className='mt-1'>Date:
                                        <span className='text-lg text-[#FFD700] mx-1'>{item.startDate.toLocaleDateString('en-GB')}
                                            {item.endDate ? ` - ${item.endDate.toLocaleDateString('en-GB')}` : ''}</span></h3>
                                    <h2 className='mt-1 mb-1'>Quantity: <span className='text-lg text-[#FFD700]'>{item.quantity}</span></h2>
                                    <hr></hr>
                                    <h4 className='mt-1'>Price: <span className='text-lg text-[#FFD700]'>{item.price * (item.quantity + dayDifference)} €</span></h4>
                                    
                                    </div><div className="w-full flex justify-center mt-4">
                                        <button color="primary" className='p-2 hover:bg-danger-200 text-white font-bold rounded-full transition-colors duration-200' onClick={() => removeFromBasket(index)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 16 16">
                                                <circle cx="8" cy="8" r="8" fill="#fe3155"></circle>
                                                <polygon fill="#fff" points="11.536,10.121 9.414,8 11.536,5.879 10.121,4.464 8,6.586 5.879,4.464 4.464,5.879 6.586,8 4.464,10.121 5.879,11.536 8,9.414 10.121,11.536"></polygon>
                                            </svg>
                                        </button>
                                        
                                    </div>
                                    </motion.div>

                            );
                        })}
                        {/* Display total price */}
                        <div className="total-price mt-4 p-4 border-t-4 border-teal-900/50 bg-teal-800/50 rounded">
                            <div className="w-full flex justify-center mt-4">
                                
                                <h2 className="price"><span className="text-white-500/50 text-xl shadow rounded p-2 bg-gray-900/50 border-1 border-white-500/50">{calculateTotalPrice(basket)} €</span></h2>
                            </div>
                        </div>
                    </motion.div>
    );
};

export default BasketComponent;
