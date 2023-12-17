//AboutSection.tsx
import React, { forwardRef } from 'react';
import Image from 'next/image';
import { commonImageProps } from './Types/types'

// Images array
const image = 
  {
    src: '/assets/team.webp',
    alt: 'Team',
  };

  const AboutSection = forwardRef<HTMLDivElement>((props, ref) => {
    return (
      <div ref={ref} className='about-container mb-10 pb-10' id='about'>
        <h2 className='text-3xl sm:text-1xl md:text-5xl lg:text-6xl xl:text-6xl font-bold mb-6 text-shadow text-center pt-10'>About Us</h2>
        <div className="about-section flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg relative w-full max-w-4xl mx-auto">
          <div className='mb-5'>
            <p className='about-text'>
              This is a fictional mtb-booking website. Our mission is straightforward: to provide easy, hassle-free mountain bike rentals that get you onto the trails quickly.<br /><br />
              We created this platform with a clear goal &ndash; making your mountain biking adventures as accessible and enjoyable as possible. We know the excitement of hitting the trails, and we believe that renting a quality mountain bike should be simple and straightforward.<br /><br />
              Our website offers a handpicked selection of top-notch mountain bikes suitable for all skill levels. The process is easy: choose your bike, book it, and you&apos;re ready to ride. No fuss, no complications.<br /><br />
              We&apos;re not just a rental service; we&apos;re a community of outdoor enthusiasts and mountain biking fans. We&apos;re here to share tips, trail recommendations, and the latest in biking gear.<br /><br />
              So, whether you&apos;re a seasoned rider or new to the sport, we&apos;re here to help you dive straight into the thrill of mountain biking. Get ready to explore the trails with ease!
            </p>
          </div>
          <Image className='rounded' {...commonImageProps} src={image.src} alt={image.alt} />
        </div>
      </div>
    );
  });
  AboutSection.displayName = 'AboutSection';

export default AboutSection;
