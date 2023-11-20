//app/page.tsx
'use client'
import React, { useRef, useEffect } from 'react';
import MainSection from './components/MainSection';
import BookingSection from './components/BookingSection';
import AboutSection from './components/AboutSection';
import TrailMapsSection from './components/TrailMapsSection';
import Footer from './components/Footer';

// Before your component definition
declare global {
  interface Window {
    _mtm: any[];
  }
}


export default function Page() {

  useEffect(() => {
    // Check if the Matomo script is already present
    if (!window._mtm) {
      window._mtm = [];
      window._mtm.push({ 'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start' });

      const d = document;
      const g = d.createElement('script');
      const s = d.getElementsByTagName('script')[0];

      if (s.parentNode) {
        g.async = true;
        g.src = '//pilvipalvelut-matomo.rahtiapp.fi/';
        s.parentNode.insertBefore(g, s);
      }
    }
  }, []);

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