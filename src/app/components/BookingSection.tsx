//BookingSection.tsx
import BikeSelector from './BikeSelector';
import BikeDetail from './BikeDetail';
import React, { forwardRef, useState, useEffect } from 'react';
import { Bike, BikeSizeKey } from './Types/types'
import Login from './Login'
import { motion } from 'framer-motion';


const BookingSection = forwardRef<HTMLDivElement>((props, ref) => {
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [isDetailVisible, setDetailVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState<BikeSizeKey | null>(null);
  const [isRegistrationCompleted, setIsRegistrationCompleted] = useState(false);

  const onSizeSelect = (size: BikeSizeKey) => {
    setSelectedSize(size);
  };

  const onSelectBike = (bike: Bike) => {
    if (selectedBike && bike.id === selectedBike.id) {
      // Deselect the bike and reset size selection
      setSelectedBike(null);
      setDetailVisible(false);
      setSelectedSize(null); // Reset size selection
    } else {
      // Select a new bike without resetting the size selection
      setSelectedBike(bike);
      setDetailVisible(true);
    }
  };


  useEffect(() => {
    if (!isDetailVisible) {
      setSelectedSize(null); // Reset size selection when detail view is closed
    }
  }, [isDetailVisible]);

  return (
    <>
      <motion.div ref={ref} className="booking-container my-8 mx-auto px-4 max-w-7xl" id='booking'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}>
        <h1 className="text-3xl sm:text-1xl md:text-5xl lg:text-6xl xl:text-6xl font-bold mb-6 text-shadow text-center pt-10">Booking</h1>
        <div className="flex flex-col lg:flex-row justify-center gap-4 w-full min-h-[300px] sm:min-h-[750px] overflow-y-auto">
          <div className="bike-selection-area mb-4 lg:mb-0 lg:w-2/4" >
            <BikeSelector
              onSelectBike={onSelectBike}
              selectedBike={selectedBike}
              onSizeSelect={onSizeSelect}
              selectedSize={selectedSize}
            />

            {isDetailVisible && selectedBike && <BikeDetail bike={selectedBike} onClose={() => setSelectedBike(null)} Small={0} Medium={0} Large={0} selectedSize={''} />}
          </div>
          <div className="lg:w-1/3">
            <Login selectedBike={selectedBike} selectedSize={selectedSize} setIsRegistrationCompleted={setIsRegistrationCompleted} isRegistrationCompleted={isRegistrationCompleted}/>
          </div >
        </div>
      </motion.div>
    </>
  );
});
BookingSection.displayName = 'BookingSection';

export default BookingSection;