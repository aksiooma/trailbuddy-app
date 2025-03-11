//RegisterationModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalProps } from './Types/types';
import { useLanguage } from '../context/LanguageContext';

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    const { t } = useLanguage();
 
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="w-full bg-gradient-to-b from-zinc-900/50 to-zinc-900/30 backdrop-blur-sm rounded-xl border border-zinc-800 shadow-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
