//Footer.tsx
'use client';

import React from 'react';
import Logo from "../../../public/assets/IGSD-logo.svg";
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-zinc-900 text-white pt-12 pb-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-zinc-300 hover:text-white transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('footer.about')}
                </a>
              </li>
              <li>
                <a href="#booking" className="text-zinc-300 hover:text-white transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('footer.booking')}
                </a>
              </li>
              <li>
                <a href="#trailmaps" className="text-zinc-300 hover:text-white transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {t('footer.maps')}
                </a>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="md:col-span-1">
            <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
              <p className="text-sm text-zinc-400">
                <span className="text-rose-500">{t('footer.disclaimer')}</span>
              </p>
              <p className="text-sm text-zinc-400 mt-2">
                <span className="text-rose-500">{t('footer.images')}</span> {t('footer.imagesDisclaimer')}
              </p>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="text-right">
            <span className="text-white font-bold text-2xl tracking-wide drop-shadow-md font-clash-display">
              Trail<span className="text-teal-400">Buddy</span>
            </span>
            <p className="text-zinc-300 mb-4 font-schibsted">Teijo Virta</p>

            <div className="flex justify-end space-x-4 mb-4">
              <a
                href="https://github.com/aksiooma/trailbuddy-app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
                aria-label="GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                </svg>
              </a>
              <a
                href="https://teijovirta.com"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors overflow-hidden"
                aria-label="Portfolio"
              >
                <Image
                  src={Logo}
                  alt="Check out my portfolio"
                  height={40}
                  width={40}  
                  className="object-contain rounded-full"
                />
              </a>
            </div>


            <p className="text-xs text-zinc-500">&copy; 2025 {t('footer.allRights')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
