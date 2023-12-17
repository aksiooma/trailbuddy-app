//app/page.tsx
'use client'
import React, { useRef, useState, useEffect } from 'react';
import MainSection from './components/MainSection';
import BookingSection from './components/BookingSection';
import AboutSection from './components/AboutSection';
import TrailMapsSection from './components/TrailMapsSection';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { AuthProvider } from './components/AuthContext';

declare global {
  interface Window { 
    _mtm: any[];
  }
}

export default function Page() {

  useEffect(() => {
    // Initialize _mtm on window object
    window._mtm = window._mtm || [];
    window._mtm.push({ 'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start' });
  
    const d = document;
    const g = d.createElement('script');
    const s = d.getElementsByTagName('script')[0];
  
    g.async = true;
  
    // Ensuring the environment variable is defined
    const matomoURL = process.env.NEXT_PUBLIC_MATOMO_TAG_MANAGER_CONTAINER_URL;
    if (!matomoURL) {
      console.error('Matomo Tag Manager container URL is not defined');
      return;
    }
    g.src = matomoURL;
  
    // Checking if parentNode exists before inserting the script
    if (s.parentNode) {
      s.parentNode.insertBefore(g, s);
    }
  }, []);

  const bookingSectionRef = useRef<HTMLDivElement>(null);
  const trailMapsSectionRef = useRef<HTMLDivElement>(null);
  const aboutUsSectionRef = useRef<HTMLDivElement>(null);

  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);

  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement>) => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (

    <AuthProvider>
      {showNavbar && <Navbar
        onBookingClick={() => scrollToSection(bookingSectionRef)}
        onTrailMapsClick={() => scrollToSection(trailMapsSectionRef)}
        onAboutUsClick={() => scrollToSection(aboutUsSectionRef)}
      />}

      <MainSection onBookNowClick={() => scrollToSection(bookingSectionRef)} />
      <BookingSection ref={bookingSectionRef} />
      <TrailMapsSection ref={trailMapsSectionRef} />
      <AboutSection ref={aboutUsSectionRef} />
      <Footer />
    </AuthProvider>

  );
}