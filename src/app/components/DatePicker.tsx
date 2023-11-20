import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AvailabilityData } from './Types/types';
import { Bike } from './Types/types';

interface BookingDatePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    setStartDate: (date: Date | null) => void;
    setEndDate: (date: Date | null) => void;
    availabilityData: AvailabilityData;
    selectedBike: Bike | null;
}

const BookingDatePicker: React.FC<BookingDatePickerProps> = ({
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    availabilityData,
    selectedBike
}) => {
    const renderDayContents = (day: number, date: Date) => {
        // Format the date as YYYY-MM-DD using local time
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        let availableStock = selectedBike?.stock ?? 0;
    
        // Check availability for the specific bike
        if (selectedBike && availabilityData[dateString] && availabilityData[dateString][selectedBike.id] !== undefined) {
            availableStock = availabilityData[dateString][selectedBike.id];
        }
    
        // Compare dates in local time
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
        // Determine the style based on availability
        let styles;
        if (currentDate < today) {
            styles = 'bg-gray-200'; // Past dates
        } else if (availableStock === 0) {
            styles = 'bg-red-400'; // Fully booked
        } else if (availableStock < (selectedBike?.stock ?? 0)) {
            styles = 'bg-yellow-500'; // Partially available
        } else {
            styles = 'bg-green-500'; // Available
        }
    
        return <div className={`${styles} p-1`}>{day}</div>;
    };
    

    return (
        <DatePicker
            className='rounded mt-4 p-2 w-full'
            selectsRange={true}
            minDate={new Date}// Disable dates before today
            startDate={startDate}
            endDate={endDate}
            onChange={(dates) => {
                const [start, end] = dates;
                setStartDate(start);
                setEndDate(end);
            }}
            dateFormat="dd/MM/yyyy"
            isClearable={true}
            renderDayContents={renderDayContents}
        />
    );
};

export default BookingDatePicker;
