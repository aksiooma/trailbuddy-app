//app/page.tsx
'use client'
import React, { useRef, useEffect } from 'react';
import MainSection from './components/MainSection';
import BookingSection from './components/BookingSection';
import AboutSection from './components/AboutSection';
import TrailMapsSection from './components/TrailMapsSection';
import Footer from './components/Footer';



export default function Page() {


  const bookingSectionRef = useRef<HTMLDivElement>(null);

  const scrollToBooking = () => {
    bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <MainSection onBookNowClick={scrollToBooking} />
      <BookingSection ref={bookingSectionRef} />
      <AboutSection />
      <TrailMapsSection />
      <Footer />
    </>
  );
}