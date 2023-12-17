//Navbar.tsx
import React, { useState } from "react";
// import Image from "next/image";
import { motion } from 'framer-motion';
import { NavbarProps } from './Types/types'

const Navbar: React.FC<NavbarProps> = ({ onBookingClick, onTrailMapsClick, onAboutUsClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (

        <header className="fixed w-full z-50">
            <div className="flex items-center justify-between px-4 py-3">
                <div>
                    {/* <Image className="h-8" src="" alt="Logo" width={32} height={32} /> */}
                </div>
                <div className="sm:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} type="button" className="block text-gray-500 hover:text-white focus:text-white focus:outline-none bg-gray-900 p-1 rounded">
                        <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path fillRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                            ) : (
                                <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            <motion.div
                initial={false}
                animate={isOpen ? "open" : "closed"}
                variants={{
                    open: { opacity: 1, x: 0 },
                    closed: { opacity: 0, x: "-100%" }
                }}
                transition={{ duration: 0.5 }}
                className={`absolute top-0 left-0 w-full sm:hidden ${isOpen ? 'block' : 'hidden'}`}
            >
                <nav className="px-2 pt-2 pb-4 bg-gray-900 cursor-pointer">
                    <a onClick={onBookingClick} className="block px-2 py-1 text-white font-semibold rounded hover:bg-gray-800 mb-2">Booking</a>
                    <a onClick={onTrailMapsClick} className="block px-2 py-1 text-white font-semibold rounded hover:bg-gray-800 mb-2">Trail Maps</a>
                    <a onClick={onAboutUsClick} className="block px-2 py-1 text-white font-semibold rounded hover:bg-gray-800 mb-2">About Us</a>
                </nav>
            </motion.div>

            <nav className="hidden sm:flex justify-end px-4 py-3 cursor-pointer ">
                <a onClick={onBookingClick} className="px-2 py-1 text-white font-semibold rounded hover:bg-gray-800 mx-2 bg-gray-900">Booking</a>
                <a onClick={onTrailMapsClick} className="px-2 py-1 text-white font-semibold rounded hover:bg-gray-800 mx-2 bg-gray-900">Trail Maps</a>
                <a onClick={onAboutUsClick} className="px-2 py-1 text-white font-semibold rounded hover:bg-gray-800 mx-2 bg-gray-900">About Us</a>
            </nav>
        </header>


    );
};

export default Navbar;
