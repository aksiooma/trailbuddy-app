//BookingSection.tsx
import BikeSelector from './BikeSelector';
import BikeDetail from './BikeDetail';
import React, { forwardRef, useState, useEffect, useCallback, useRef } from 'react';
import { Bike, BikeSizeKey } from './Types/types'
import Login from './Login'
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { AvailabilityData } from './Types/types';

const BookingSection = forwardRef<HTMLDivElement>((props, ref) => {
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [isDetailVisible, setDetailVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState<BikeSizeKey | null>(null);
  const [isRegistrationCompleted, setIsRegistrationCompleted] = useState(false);
  const { t } = useLanguage();
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [accessories, setAccessories] = useState<{ id: string; name: string; price: number }[]>([]);
  const datePickerRef = useRef(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedBikeAvailableStock, setSelectedBikeAvailableStock] = useState<number>(0);
  const [dateAvailability, setDateAvailability] = useState<AvailabilityData>({});
  const [availableStockBySize, setAvailableStockBySize] = useState<{ [key in BikeSizeKey]?: number }>({});
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
      setAccessories([
          { id: 'helmet', name: t('accessories.helmet'), price: 5 },
          { id: 'lock', name: t('accessories.lock'), price: 3 },
          { id: 'lights', name: t('accessories.lights'), price: 4 },
          { id: 'bottle', name: t('accessories.bottle'), price: 2 }
      ]);
  }, [t]);


  const handleAccessoryToggle = (accessoryId: string) => {
    setSelectedAccessories((prev) => {
        const newAccessories = prev.includes(accessoryId)
            ? prev.filter((id) => id !== accessoryId)
            : [...prev, accessoryId];

        console.log("Updated selectedAccessories:", newAccessories); // 🔍 Debug-logi
        return newAccessories;
    });
};

  
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


  // function to calculate available stock for size
  const calculateAvailableStock = useCallback((size: BikeSizeKey, bike: Bike, start: Date, end: Date) => {
    if (!bike || !size || !start) return 0;

    let minAvailableQuantity = Infinity;
    
    // Jos päivämääräalue on määritelty
    if (end && start < end) {
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        const bikeAvailability = dateAvailability[dateString]?.[bike.id];
        
        if (bikeAvailability) {
          const availableStock = bikeAvailability[size];
          if (availableStock !== undefined) {
            minAvailableQuantity = Math.min(minAvailableQuantity, availableStock);
          }
        }
        
      
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
      }
    } else {
     
      const dateString = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      const bikeAvailability = dateAvailability[dateString]?.[bike.id];
      
      if (bikeAvailability && bikeAvailability[size] !== undefined) {
        minAvailableQuantity = bikeAvailability[size];
      } else {

        minAvailableQuantity = bike[size] || 0;
      }
    }
    
    return minAvailableQuantity === Infinity ? 0 : minAvailableQuantity;
  }, [dateAvailability]);

  // update available stock for size
  useEffect(() => {
    if (selectedBike && startDate) {
      const sizes: BikeSizeKey[] = ['Small', 'Medium', 'Large'];
      const newAvailableStockBySize: { [key in BikeSizeKey]?: number } = {};
      
      sizes.forEach(size => {
        newAvailableStockBySize[size] = calculateAvailableStock(
          size, 
          selectedBike, 
          startDate, 
          endDate || startDate
        );
      });
      
      setAvailableStockBySize(newAvailableStockBySize);
    }
  }, [selectedBike, startDate, endDate, calculateAvailableStock]);

  // available stock for size
  const getAvailableStockForSize = (size: BikeSizeKey): number => {
    return availableStockBySize[size] || 0;
  };
  return (
    <div ref={ref} className="py-16" id="booking">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-metrophic">
            {t('booking.title')}
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-schibsted">
            {t('booking.subtitle')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column: Bike selection and details */}
          <motion.div 
            className="lg:w-7/12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-b from-zinc-900/50 to-zinc-900/30 backdrop-blur-sm p-6 rounded-xl border border-zinc-800 shadow-xl mb-8">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center font-metrophic">
                <span className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                {t('booking.selectBike')}
              </h3>
              
              <BikeSelector
                onSelectBike={onSelectBike}
                selectedBike={selectedBike}
                onSizeSelect={onSizeSelect}
                selectedSize={selectedSize}
                accessories={accessories} 
                selectedAccessories={selectedAccessories}
                setSelectedAccessories={setSelectedAccessories}
                handleAccessoryToggle={handleAccessoryToggle} 
                getAvailableStockForSize={getAvailableStockForSize}
                startDate={startDate}
                datePickerRef={datePickerRef}
                userLoggedIn={userLoggedIn}
              />
            </div>

            {isDetailVisible && selectedBike && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <BikeDetail 
                  bike={selectedBike} 
                  onClose={() => setSelectedBike(null)} 
                  Small={0} 
                  Medium={0} 
                  Large={0} 
                  selectedSize={''} 
                />
              </motion.div>
            )}
          </motion.div>
          

          {/* Right column: Login and booking form */}
          <motion.div 
            className="lg:w-5/12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-b from-zinc-900/50 to-zinc-900/30 backdrop-blur-sm p-6 rounded-xl border border-zinc-800 shadow-xl sticky top-24">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center font-metrophic">
                <span className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                {t('booking.completeReservation')}
              </h3>
              
              <Login 
                selectedBike={selectedBike} 
                selectedSize={selectedSize} 
                setIsRegistrationCompleted={setIsRegistrationCompleted} 
                isRegistrationCompleted={isRegistrationCompleted}
                handleAccessoryToggle={handleAccessoryToggle}
                selectedAccessories={selectedAccessories}
                setSelectedAccessories={setSelectedAccessories}
                accessories={accessories}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                selectedBikeAvailableStock={selectedBikeAvailableStock}
                dateAvailability={dateAvailability}
                setSelectedBikeAvailableStock={setSelectedBikeAvailableStock}
                setDateAvailability={setDateAvailability}
                datePickerRef={datePickerRef}
                userLoggedIn={userLoggedIn}
                setUserLoggedIn={setUserLoggedIn}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

BookingSection.displayName = 'BookingSection';

export default BookingSection;