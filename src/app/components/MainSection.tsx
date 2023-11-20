// Import Swiper React components

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {commonImageProps} from './Types/types'

// Images array
const images = [
  {
    src: '/assets/Landscape_2.webp',
    alt: 'Trail Image 1',
  },
  {
    src: '/assets/Landscape_3.webp',
    alt: 'Trail Image 2',
  },

];

// The prop types for MainSection
type MainSectionProps = {
  onBookNowClick: () => void; // This function will be called when the button is clicked
};

const MainSection: React.FC<MainSectionProps> = ({ onBookNowClick }) => {

  return (
    <div className="main-section mb-10">
      <div className="relative container mx-auto max-w-custom-large h-auto">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={50}
          slidesPerView={1}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <Image
                {...commonImageProps}
                src={image.src}
                alt={image.alt}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 bg-[#020617] p-5 sm:p-5 rounded bg-opacity-50 sm:bg-opacity-70 w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
          <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 text-white">Welcome to TrailBuddy</h1>
          <p className="text-1xl sm:text-2xl md:text-2xl lg:text-4xl xl:text-4xl mb-4 text-white">Your trail adventure starts here</p>
          <button
            onClick={onBookNowClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
          >
            Book Now
          </button>
        </div>

      </div>
      <p className="text-2xl sm:text-1xl md:text-3xl lg:text-3xl xl:text-3xl mb-4 text-white text-center px-5 mt-5 mb-10">Your reliable MTB-rental companion and trail advisor</p>
    </div>
  );
};

export default MainSection;

