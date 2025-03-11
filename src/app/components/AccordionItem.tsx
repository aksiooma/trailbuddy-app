import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccordionItemProps } from './Types/types';

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, className, ariaLabel }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleOpen = () => setIsOpen(!isOpen);
  
    return (
      <div className={className}>
        <button 
          onClick={toggleOpen} 
          aria-label={ariaLabel} 
          className="flex justify-between items-center w-full p-4 text-left focus:outline-none"
        >
          <span className="text-lg font-medium text-white">{title}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-5 h-5 text-teal-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            > 
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  export default AccordionItem;
