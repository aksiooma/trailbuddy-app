import React, {useState} from "react";
import { motion } from 'framer-motion';

// Define the structure for a reservation item
interface ReservationItem {
    name: string;
    quantity: number;
    startDate: Date;
    endDate: Date | null;
}

interface BasketProps {
    removeFromBasket: any
    
}

const Basket: React.FC<BasketProps> = ({
   removeFromBasket
}) => {
const [basket, setBasket] = useState<ReservationItem[]>([]);


    return (

        <motion.div className="basket p-5 border-4 border-green-500/50 rounded-lg mt-5 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}>
            {basket.map((item, index) => (
                <motion.div className='flex justify-between items-center p-4 border-2 border-green-500/50 rounded-lg bg-black' key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}>
                    {item.name}, <br /> Quantity: {item.quantity}, <br />Date:<br />
                    {item.startDate.toLocaleDateString('en-GB')}
                    {item.endDate ? ` - ${item.endDate.toLocaleDateString('en-GB')}` : ''}
                    <button color="primary" className='p-2 hover:bg-danger-200 text-white font-bold rounded-full transition-colors duration-200 mx-5' onClick={() => removeFromBasket(index)}><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 16 16">
                        <circle cx="8" cy="8" r="8" fill="#fe3155"></circle><polygon fill="#fff" points="11.536,10.121 9.414,8 11.536,5.879 10.121,4.464 8,6.586 5.879,4.464 4.464,5.879 6.586,8 4.464,10.121 5.879,11.536 8,9.414 10.121,11.536"></polygon>
                    </svg></button></motion.div>

            ))}
        </motion.div>
    )
}

export default Basket