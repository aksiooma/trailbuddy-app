//AboutSection.tsx
import React, { forwardRef } from 'react';
import Image from 'next/image';
import { commonImageProps } from './Types/types';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

const image =
{
  src: '/assets/team.webp',
  alt: 'Team',
};

const AboutSection = forwardRef<HTMLDivElement>((props, ref) => {
  const { t } = useLanguage();

  return (
    <div ref={ref} className='about-container mb-10 pb-10 font-schibsted' id='about'>
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className='text-3xl sm:text-1xl md:text-5xl lg:text-6xl xl:text-6xl font-bold mb-6 text-shadow text-center pt-10'
      >
        {t('about.title') || 'About Us'}
      </motion.h2>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
        className="bg-gradient-to-b from-zinc-900/50 to-zinc-900/30 backdrop-blur-sm rounded-xl border border-zinc-800 shadow-xl overflow-hidden container mx-auto"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 md:p-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              {t('about.subtitle') || 'Our Story'}
            </h3>
            
            <div className="space-y-4 text-zinc-300">
              <p>
                <span className='font-bold text-rose-500'>{t('about.disclaimer') || "This is a fictional mtb-booking website."}</span> {t('about.mission') || "Our mission is straightforward: to provide easy, hassle-free mountain bike rentals that get you onto the trails quickly."}
              </p>
              
              <p>
                {t('about.goal') || "We created this platform with a clear goal – making your mountain biking adventures as accessible and enjoyable as possible. We know the excitement of hitting the trails, and we believe that renting a quality mountain bike should be simple and straightforward."}
              </p>
              
              <p>
                {t('about.offering') || "Our website offers a handpicked selection of top-notch mountain bikes suitable for all skill levels. The process is easy: choose your bike, book it, and you're ready to ride. No fuss, no complications."}
              </p>
              
              <p>
                {t('about.community') || "We're not just a rental service; we're a community of outdoor enthusiasts and mountain biking fans. We're here to share tips, trail recommendations, and the latest in biking gear."}
              </p>
              
              <p>
                {t('about.conclusion') || "So, whether you're a seasoned rider or new to the sport, we're here to help you dive straight into the thrill of mountain biking. Get ready to explore the trails with ease!"}
              </p>
            </div>
          </div>
          
          <div className="relative h-full min-h-[300px] md:min-h-full">
            <Image 
              src={image.src} 
              alt={image.alt} 
              {...commonImageProps}
              priority={false} 
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => console.error("Kuvaa ei voitu ladata")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
AboutSection.displayName = 'AboutSection';

export default AboutSection;
