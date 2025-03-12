//Navbar.tsx
'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { NavbarProps } from './Types/types';
import { useLanguage } from '../context/LanguageContext';
import Image from 'next/image';
import { useUser } from '../context/AuthContext';

// Liput kielenvalintaa varten
const flags = {
  en: '/assets/flags/gb.svg',
  fi: '/assets/flags/fi.svg'
};

const Navbar: React.FC<NavbarProps> = ({ onBookingClick, onTrailMapsClick, onAboutUsClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useUser();
  
  // Follows the scroll and adds a background when the user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fi' : 'en');
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-500 ${scrolled
      ? 'bg-zinc-900/90 backdrop-blur-md shadow-lg'
      : 'bg-gradient-to-b from-zinc-900/90 via-zinc-900/30 via-zinc-900/10 to-transparent backdrop-blur-sm'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center space-x-2">
            <span className="text-white font-bold text-2xl tracking-wide drop-shadow-md font-clash-display">
              Trail<span className="text-teal-400">Buddy</span>
            </span>
          </div>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-5 font-metrophic-bold">
            <button
              onClick={onBookingClick}
              className="text-white hover:text-teal-300 px-5 py-3 rounded-lg text-base font-medium transition-all hover:bg-teal-500/20 shadow-md"
            >
              {t('nav.booking')}
            </button>
            <button
              onClick={onTrailMapsClick}
              className="text-white hover:text-teal-300 px-5 py-3 rounded-lg text-base font-medium transition-all hover:bg-teal-500/20 shadow-md"
            >
              {t('nav.trailMaps')}
            </button>
            <button
              onClick={onAboutUsClick}
              className="text-white hover:text-teal-300 px-5 py-3 rounded-lg text-base font-medium transition-all hover:bg-teal-500/20 shadow-md"
            >
              {t('nav.aboutUs')}
            </button>

            {/* Kielenvaihto */}
            <button
              onClick={toggleLanguage}
              className="ml-4 p-2 rounded-full overflow-hidden border-2 border-white/40 hover:border-teal-400 transition-all hover:bg-teal-500/20 shadow-md"
              aria-label={`Switch to ${language === 'en' ? 'Finnish' : 'English'}`}
            >
              <div className="w-7 h-7 relative">
                <Image
                  src={flags[language === 'en' ? 'fi' : 'en']}
                  alt={language === 'en' ? 'Suomi' : 'English'}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            </button>
            {user ? (
              <button
                onClick={() => { logout(); onBookingClick(); }}
                className="p-3 rounded-full bg-rose-900/20 border border-rose-800/90 text-rose-600 hover:border-teal-400 transition-all hover:bg-teal-500/20 shadow-md"
                aria-label="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => {
                  onBookingClick();
                  setIsOpen(false);
                }}
                className="p-3 rounded-full bg-green-900/50 border border-green-800/90 text-green-600 hover:border-teal-400 transition-all hover:bg-teal-500/20 shadow-md"
                aria-label="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center justify-end w-full max-w-[200px]">
            {user ? (
              <button
                onClick={() => { logout(); onBookingClick(); }}
                className="p-2 rounded-full bg-rose-900/20 border border-rose-800/90 text-rose-600 hover:border-teal-400 transition-all hover:bg-teal-500/20 shadow-md"
                aria-label="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => {
                  onBookingClick();
                  setIsOpen(false);
                }}
                className="p-2 rounded-full bg-green-900/50 border border-green-800/90 text-green-600 hover:border-teal-400 transition-all hover:bg-teal-500/20 shadow-md"
                aria-label="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            )}
            
            <button
              onClick={toggleLanguage}
              className="mx-2 p-2 rounded-full overflow-hidden border-2 border-white/40 hover:border-teal-400 transition-all hover:bg-teal-500/20 shadow-md"
              aria-label={`Switch to ${language === 'en' ? 'Finnish' : 'English'}`}
            >
              <div className="w-7 h-7 relative">
                <Image
                  src={flags[language === 'en' ? 'fi' : 'en']}
                  alt={language === 'en' ? 'Suomi' : 'English'}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 rounded-lg text-white hover:text-teal-300 bg-zinc-800/70 hover:bg-teal-500/20 transition-all shadow-md"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gradient-to-b from-zinc-900/90 to-zinc-900/80 backdrop-blur-md shadow-lg"
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              <div 
                onClick={() => {
                  setIsOpen(false);
                  setTimeout(() => {
                    onBookingClick();
                  }, 100);
                }}
                className="text-white hover:text-teal-300 bg-zinc-800/70 hover:bg-teal-500/20 block px-4 py-3 rounded-lg text-lg font-medium w-full text-left transition-all shadow-md cursor-pointer touch-action-manipulation"
                role="button"
                tabIndex={0}
              >
                {t('nav.booking')}
              </div>
              <div
                onClick={() => {
                  setIsOpen(false);
                  setTimeout(() => {
                    onTrailMapsClick();
                  }, 100);
                }}
                className="text-white hover:text-teal-300 bg-zinc-800/70 hover:bg-teal-500/20 block px-4 py-3 rounded-lg text-lg font-medium w-full text-left transition-all shadow-md cursor-pointer touch-action-manipulation"
                role="button"
                tabIndex={0}
              >
                {t('nav.trailMaps')}
              </div>
              <div
                onClick={() => {
                  setIsOpen(false);
                  setTimeout(() => {
                    onAboutUsClick();
                  }, 100);
                }}
                className="text-white hover:text-teal-300 bg-zinc-800/70 hover:bg-teal-500/20 block px-4 py-3 rounded-lg text-lg font-medium w-full text-left transition-all shadow-md cursor-pointer touch-action-manipulation"
                role="button"
                tabIndex={0}
              >
                {t('nav.aboutUs')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
