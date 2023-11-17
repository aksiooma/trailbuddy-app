// components/BookingSection.tsx
import BikeSelector from './BikeSelector';
import BikeDetail from './BikeDetail';
import React, { forwardRef, useState } from 'react';
import { Bike } from './Types/types'
import Login from './Login'
import { motion } from 'framer-motion';


const BookingSection = forwardRef<HTMLDivElement>((props, ref) => {
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [isDetailVisible, setDetailVisible] = useState(false);

  const onSelectBike = (bike: Bike) => {
    if (selectedBike && bike.id === selectedBike.id) {
      // Deselect the bike and hide details
      setSelectedBike(null);
      setDetailVisible(false);
    } else {
      // Select a new bike and show details
      setSelectedBike(bike);
      setDetailVisible(true);
    }
  };


  return (
    <>
      <motion.div ref={ref} className="booking-container my-8 mx-auto px-4 max-w-7xl" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}>
        <h1 className="text-3xl sm:text-1xl md:text-5xl lg:text-6xl xl:text-6xl font-bold mb-6 text-shadow text-center pt-10">Booking</h1>
        <div className="flex flex-col lg:flex-row justify-center gap-4 w-full min-h-[300px] sm:min-h-[750px] overflow-y-auto">
          <div className="bike-selection-area mb-4 lg:mb-0 lg:w-2/4" >
            <BikeSelector onSelectBike={onSelectBike} selectedBike={selectedBike} />
            {isDetailVisible && selectedBike && <BikeDetail bike={selectedBike} onClose={() => setSelectedBike(null)} />}
          </div>
          <div className="lg:w-1/3">
            <Login selectedBike={selectedBike} />
          </div>
        </div>
      </motion.div>
    </>


  );
});
BookingSection.displayName = 'BookingSection';

export default BookingSection;