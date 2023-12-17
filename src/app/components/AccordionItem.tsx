import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccordionItemProps } from './Types/types';

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, className, ariaLabel }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleOpen = () => setIsOpen(!isOpen);
  
    return (
      <div className={className}>
        <button onClick={toggleOpen} aria-label={ariaLabel} className="flex justify-between items-center w-full">
          {title}
          <span className={`arrow-icon ${isOpen ? 'rotate-90' : ''}`}>➤</span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className='mt-2'
            > 
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  export default AccordionItem;
