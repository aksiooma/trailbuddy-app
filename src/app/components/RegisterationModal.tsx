import React, {useState, useEffect} from 'react';
import { motion } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    loginMethod: string;
}

<motion.div className='Login' initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}></motion.div>

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    const [loginMethod, setLoginMethod] = useState('');


    useEffect(() => {
        // Retrieve login method from localStorage
        const storedLoginMethod = localStorage.getItem('loginMethod');
        if (storedLoginMethod) {
            setLoginMethod(storedLoginMethod);
        }
    }, []);

    return (
        
        <motion.div initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }} className="modal modal-backdrop rounded mt-5">
            <div className="modal-content">
                {children}
                {loginMethod !== "Google" && (
                <button onClick={onClose} className='mt-5 bg-rose-500/50 border-2 border-white-500/50 hover:bg-blue-700/50 text-white font-bold rounded-full transition-colors duration-200 p-2'>Close</button>
                )}
            </div>
        </motion.div>
    );
};

export default Modal;
