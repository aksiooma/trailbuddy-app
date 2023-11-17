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
        const dateString = date.toISOString().split('T')[0];
        const availableStock = availabilityData[dateString] ?? selectedBike?.stock ?? 0; // Safeguard against undefined
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log(JSON.stringify(availabilityData) + "datepicker")

        let styles;
        if (date < today) {
            styles = 'bg-gray-200'; // Style for dates in the past
        } else if (availableStock === 0) {
            styles = 'bg-red-200'; // No availability
        } else if (availableStock < (selectedBike?.stock ?? 0)) {
            styles = 'bg-yellow-200'; // Partial availability
        } else {
            styles = 'bg-green-200'; // Full availability
        }
    
        return <div className={`${styles} p-1`}>{day}</div>;
    };

    return (
        <DatePicker
            className='rounded mt-4 p-2'
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
