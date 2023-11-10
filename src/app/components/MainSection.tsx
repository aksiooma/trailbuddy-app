// Import Swiper React components

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Common image properties
const commonImageProps = {
  width: 900,
  height: 500,
  quality: 100,
  layout: "responsive" as const, // Use "as const" to ensure TypeScript understands it's a literal
};

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

// the prop types for MainSection
type MainSectionProps = {
  onBookNowClick: () => void; // This function will be called when the button is clicked
};

const MainSection: React.FC<MainSectionProps> = ({ onBookNowClick }) => {

  return (
    <div className="main-section mt-1 mb-10">
      <div className="relative container mx-auto max-w-custom-large h-auto px-4">
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 bg-gray-800 p-2 md:p-3 rounded bg-opacity-70 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 text-white">Welcome to TrailBuddy</h1>
          <p className="text-xs sm:text-sm md:text-md lg:text-lg xl:text-xl mb-4 text-white">Your trail adventure starts here</p>
          <button
            onClick={onBookNowClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 sm:py-2 md:py-2 px-2 sm:px-4 md:px-4 rounded-full transition-colors duration-200"
          >
            Book Now
          </button>
        </div>
      </div>
      <p className="text-md mb-4 text-white text-center px-5 mt-5">Your reliable MTB-rental companion and trail advisor</p>
    </div>
  );
};

export default MainSection;

