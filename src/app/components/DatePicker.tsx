import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AvailabilityData, BikeSizeKey } from './Types/types';
import { Bike } from './Types/types';


interface BookingDatePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    setStartDate: (date: Date | null) => void;
    setEndDate: (date: Date | null) => void;
    availabilityData: AvailabilityData;
    selectedBike: Bike | null;
    selectedSize: BikeSizeKey | null; // Add this
   
}

const BookingDatePicker: React.FC<BookingDatePickerProps> = ({
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    availabilityData,
    selectedBike,
    selectedSize,
   
}) => {
    const renderDayContents = (day: number, date: Date) => {
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        let availableStock = 0;

        if (selectedBike && selectedSize && availabilityData[dateString] && availabilityData[dateString][selectedBike.id]) {
            availableStock = availabilityData[dateString][selectedBike.id][selectedSize] || 0;
        }

        // Compare dates in local time
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());


        // Check if the date is selected or in range
        const isSelectedDate = startDate && currentDate.getTime() === startDate.getTime();
        const isInDateRange = startDate && endDate && currentDate >= startDate && currentDate <= endDate;



        // Styles for selected and in-range days
        const selectedDayStyle = 'bg-teal-500/50 text-white border-1 border-gray-500/50';
        const inRangeDayStyle = 'bg-teal-600/50 border-1 border-gray-500/50';

        // Determine the style based on availability and date selection
        let styles = '';
        if (isSelectedDate) {
            styles = selectedDayStyle;
        } else if (isInDateRange) {
            styles = inRangeDayStyle;
        } else if (currentDate < today) {
            styles = 'bg-gray-200/50'; // Past dates
        } else if (availableStock === 0) {
            styles = 'bg-rose-500/50'; // Fully booked
        } else if (availableStock < (selectedBike?.stock ?? 0)) {
            styles = 'bg-yellow-600/50'; // Partially available
        } else {
            styles = 'bg-green-600/50'; // Available
        }

        return <div className={`${styles} p-1`}>{day}</div>;
    };

    //Set the max available date range to 120 days
    const startDateRange = new Date();
    startDateRange.setHours(0, 0, 0, 0); // Set to start of today
    const endDateRange = new Date(startDateRange);
    endDateRange.setDate(endDateRange.getDate() + 120); // Next 120 days


    const handleDateChange = (dates: [any, any]) => {
        const [start, end] = dates;

        // If both start and end dates are selected
        if (start && end) {
            const dayDifference = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

            // Check if the selected range exceeds 7 days
            if (dayDifference > 7) {
                // Adjust end date to 7 days from start date
                const adjustedEndDate = new Date(start);
                adjustedEndDate.setDate(adjustedEndDate.getDate() + 6); // Add 6 days to include the start day in the 7-day count
                setEndDate(adjustedEndDate);
            } else {
                // Range is within 7 days
                setEndDate(end);
            }
        } else {
            // Only start date is selected or both dates are cleared
            setEndDate(null);
        }

        // Update start date
        setStartDate(start);
    };

    return (
        <DatePicker
            calendarClassName='mt-3 p-2'
            selectsRange={true}
            minDate={new Date}// Disable dates before today
            maxDate={endDateRange}
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            isClearable={true}
            renderDayContents={renderDayContents}
            monthsShown={1}
            inline
        />
    );
};

export default BookingDatePicker;
