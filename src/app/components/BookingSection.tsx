// components/BookingSection.tsx
import BikeSelector from './BikeSelector';
import BikeDetail from './BikeDetail';
import BookingForm from './BookingForm';
import React, { forwardRef, useState } from 'react';

const BookingSection = forwardRef<HTMLDivElement>((props, ref) => {
  const [isDetailVisible, setDetailVisible] = useState(false);

  const toggleDetails = () => {
    setDetailVisible(!isDetailVisible);
  };

  return (
    <>
   
      <div ref={ref} className="booking-container my-8 mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl sm:text-1xl md:text-5xl lg:text-6xl xl:text-6xl font-bold mb-6 text-shadow text-center pt-10">Booking</h1>
        <div className="flex flex-col lg:flex-row justify-center gap-4 w-full">
          <div className="bike-selection-area cursor-pointer mb-4 lg:mb-0 lg:w-2/4" onClick={toggleDetails}>
            <BikeSelector />
            {isDetailVisible && <BikeDetail />}
          </div>
          <div className="lg:w-1/3">
            <BookingForm />
          </div>
        </div>
      </div>
    </>


  );
});
BookingSection.displayName = 'BookingSection';

export default BookingSection;