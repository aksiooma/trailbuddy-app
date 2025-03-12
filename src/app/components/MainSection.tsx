//MainSection.tsx
'use client';

import React, {useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useLanguage } from '../context/LanguageContext';
import Image from 'next/image';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';
import SwiperCore from 'swiper';

import { MainSectionProps, heroImageProps } from './Types/types';

// Register Autoplay module
SwiperCore.use([Autoplay]);

const images = [
  {
    src: '/assets/mtb.webp',
    alt: 'Trail Image 1',
    blur: '/assets/mtb-2.webp'
  },
  {
    src: '/assets/mtb6.webp',
    alt: 'Trail Image 2',
    blur: '/assets/mtb6-3.webp'
  },
];

const MainSection: React.FC<MainSectionProps> = ({ onBookNowClick }) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef<any>(null);

  return (
    <div className="main-section mb-10">
      <div className="relative container mx-auto max-w-custom-large h-auto">
        <Swiper
          spaceBetween={50}
          slidesPerView={1}
          onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
          autoplay={{
            delay: 6500,
            disableOnInteraction: false, // Continue autoplay after user interaction
          }}
          modules={[Autoplay]} // Add Autoplay module
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative">
                <Image
                  {...heroImageProps}
                  src={image.src}
                  alt={image.alt}
                  priority={true}
                  placeholder="blur"
                  blurDataURL={image.blur}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 via-zinc-900/30 to-transparent pointer-events-none"></div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 w-full max-w-4xl px-4 mt-2">
          <div className="relative inline-block">
            <div
              className={`absolute inset-0 bg-gradient-to-b from-teal-300 via-zinc-900/30 ${currentIndex === 1 ? 'to-rose-700' : 'to-indigo-600'
                } opacity-30 blur-sm group-hover:opacity-100 transition duration-300 transform scale-100 md:scale-125 splatter-clip-path`}
            ></div>
            <p className='text-4xl sm:text-5xl md:text-8xl mb-4 text-white font-thin tracking-tight relative z-10 font-clash-display'>{t('main.welcome')}</p>
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-extrabold mb-4 text-white tracking-tight relative z-10 font-clash-display-bold">
              <span className="text-white"> {t('main.welcomePart1')}</span>
              <span className="text-teal-400">{t('main.welcomePart2')}</span>
            </h1>
          </div>

          <div className="relative mt-2 md:mt-10">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-200 to-orange-400 splatter-clip-path opacity-60 blur-sm group-hover:opacity-100 transition duration-300 scale-100 md:scale-125 rounded-full"></div>
            <p className="relative text-1xl sm:text-3xl md:text-3xl mb-4 text-white font-thin tracking-tight z-10 font-clash-display">
              {t('main.subtitle')}
            </p>
          </div>

          <div className="relative inline-block group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full opacity-70 blur-sm group-hover:opacity-100 transition duration-300 mt-0 md:mt-3"></div>
            <button
              onClick={onBookNowClick}
              className="relative bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-regular rounded-full transition-all duration-300 py-2 md:py-3 mt-0 md:mt-3 px-6 text-lg shadow-xl "
            >
              {t('main.bookNow')}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-custom-large font-clash-display">
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-1000 py-6 rounded-b-lg w-full shadow-lg">
          <p className="text-xl md:text-2xl lg:text-3xl text-white text-center px-5">
            <span className="font-light">{t('main.descriptionPart1')}</span>
            <span className="font-bold text-teal-400">{t('main.fictional')}</span>
            <span className="font-light">{t('main.descriptionPart2')}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainSection;


