//MainSection.tsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import Image from 'next/image';
import 'swiper/css';

import { MainSectionProps, heroImageProps } from './Types/types';


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


const swiperParams = {
  lazy: {
      loadPrevNext: true, 
  },
  preloadImages: false, 
  watchSlidesVisibility: true, 
};

const MainSection: React.FC<MainSectionProps> = ({ onBookNowClick }) => {

  return (
    <div className="main-section mb-10">
      <div className="relative container mx-auto max-w-custom-large h-auto">
        <Swiper {...swiperParams}
          spaceBetween={50}
          slidesPerView={1}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <Image
              {...heroImageProps}
                src={image.src}
                alt={image.alt}
                priority={true}
                placeholder="blur"
                blurDataURL={image.blur}
                />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 bg-[#020617] p-5 rounded w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl bg-opacity-0 md:bg-opacity-50">
          <h1 className="[text-shadow:_1px_1px_0_rgb(0_0_0_/_40%)] text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 text-white ">Welcome to TrailBuddy</h1>
          <p className="[text-shadow:_1px_1px_0_rgb(0_0_0_/_40%)] sm:text-2xl md:text-2xl lg:text-4xl xl:text-4xl mb-4 text-white hidden md:block">Your trail adventure starts here</p>
          <button
            onClick={onBookNowClick}
            className="[text-shadow:_1px_1px_0_rgb(0_0_0_/_40%)] bg-teal-500/50 border-2 border-white-500/50 hover:bg-blue-900/50 text-white font-bold rounded-full transition-colors duration-200 py-2 px-4"
          >
            Book Now
          </button>
        </div>

      </div>
      <p className="text-2xl sm:text-1xl md:text-3xl lg:text-3xl xl:text-3xl mb-4 text-white text-center px-5 mt-5 mb-10">Your <span className='font-bold text-rose-800'>fictional</span> MTB-rental companion and trail advisor</p>
    </div>
  );
};

export default MainSection;

