import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BookingDatePickerProps } from './Types/types';
import { useLanguage } from '../context/LanguageContext';
import fi from 'date-fns/locale/fi';
import enUS from 'date-fns/locale/en-US';

const BookingDatePicker: React.FC<BookingDatePickerProps> = ({
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    availabilityData,
    selectedBike,
    selectedSize,
}) => {
    const { language, t } = useLanguage();
    const [showRangeMessage, setShowRangeMessage] = useState(false);

    // Lisätään mukautettu CSS-tyyli kalenterille
    useEffect(() => {
        // Tarkistetaan, onko tyylitiedosto jo lisätty
        if (!document.getElementById('datepicker-custom-styles')) {
            const style = document.createElement('style');
            style.id = 'datepicker-custom-styles';
            style.innerHTML = `
                .react-datepicker {
                    width: 100% !important;
                    max-width: 100% !important;
                    font-family: inherit !important;
                    border: none !important;
                    background-color: transparent !important;
                }
                .react-datepicker__month-container {
                    width: 100% !important;
                    float: none !important;
                }
                .react-datepicker__header {
                    background-color: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    padding-top: 0.8rem !important;
                    padding-bottom: 0.8rem !important;
                }
                .react-datepicker__day-names, .react-datepicker__week {
                    display: flex !important;
                    justify-content: space-around !important;
                    width: 100% !important;
                }
                .react-datepicker__day-name, .react-datepicker__day {
                    margin: 0.2rem !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    flex: 1 !important;
                    height: 2.5rem !important;
                    max-width: 2.5rem !important;
                }
                .react-datepicker__month {
                    margin: 0.4rem 0 !important;
                    padding: 0 0.5rem !important;
                }
                .react-datepicker__current-month {
                    font-size: 1rem !important;
                    font-weight: 600 !important;
                    color: white !important;
                    padding-bottom: 0.5rem !important;
                }
                .react-datepicker__day-name {
                    color: rgba(255, 255, 255, 0.6) !important;
                    font-weight: 500 !important;
                }
                .react-datepicker__navigation {
                    top: 1rem !important;
                }
                .react-datepicker__navigation--previous {
                    left: 1rem !important;
                }
                .react-datepicker__navigation--next {
                    right: 1rem !important;
                }
                .react-datepicker__navigation-icon::before {
                    border-color: rgba(255, 255, 255, 0.6) !important;
                }
                .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
                    border-color: white !important;
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    useEffect(() => {
        if (showRangeMessage) {
            const timer = setTimeout(() => {
                setShowRangeMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showRangeMessage]);

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

        // Check if the date is beyond the 7-day limit
        const isExceedingRange = startDate && !endDate && currentDate > new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);

        // Styles for selected and in-range days
        const selectedDayStyle = 'bg-teal-500 text-white rounded-full font-medium';
        const inRangeDayStyle = 'bg-teal-100/20 text-teal-300 rounded-sm';
        const exceedingRangeStyle = 'bg-red-100/20 text-red-300 rounded-sm cursor-not-allowed';

        // Determine the style based on availability and date selection
        let styles = 'flex items-center justify-center h-8 w-8 mx-auto';
        if (isSelectedDate) {
            styles += ` ${selectedDayStyle}`;
        } else if (isInDateRange) {
            styles += ` ${inRangeDayStyle}`;
        } else if (isExceedingRange) {
            styles += ` ${exceedingRangeStyle}`;
        } else if (currentDate < today) {
            styles += ' text-gray-600 line-through'; // Past dates
        } else if (availableStock === 0) {
            styles += ' text-rose-500 bg-rose-500/10 rounded-sm'; // Fully booked
        } else if (availableStock < (selectedBike?.stock ?? 0)) {
            styles += ' text-amber-400 bg-amber-500/10 rounded-sm'; // Partially available
        } else {
            styles += ' text-emerald-400 bg-emerald-500/10 rounded-sm'; // Available
        }

        return <div className={styles}>{day}</div>;
    };

    // Set the max available date range to 120 days
    const startDateRange = new Date();
    startDateRange.setHours(0, 0, 0, 0); // Set to start of today
    const endDateRange = new Date(startDateRange);
    endDateRange.setDate(endDateRange.getDate() + 120); // Next 120 days

    // handle date change
    const handleDateChange = (dates: [any, any]) => {
        const [start, end] = dates;

        if (start && !end) {
            setStartDate(start);
            setEndDate(null);
            return;
        }

        if (start && end) {
            const dayDifference = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            if (dayDifference > 7) {               
                const adjustedEndDate = new Date(start);
                adjustedEndDate.setDate(adjustedEndDate.getDate() + 6); 
                setEndDate(adjustedEndDate);
                setShowRangeMessage(true);
            } else {            
                setEndDate(end);
            }
        } else {
          
            setEndDate(null);
            setStartDate(start);
        }

   
        setStartDate(start);
    };

    // check if date is selectable
    const isDateSelectable = (date: Date) => {
        if (!startDate) return true;

        const maxDate = new Date(startDate);
        maxDate.setDate(maxDate.getDate() + 6);

        if (endDate && startDate.getTime() === endDate.getTime()) {
            return true; 
        }

        return date <= maxDate; 
    };

    return (
        <div className="w-full">
            {showRangeMessage && (
                <div className="mb-3 p-2 bg-amber-500/20 border border-amber-500/30 rounded-md text-amber-400 text-sm">
                    {t('datepicker.maxRangeMessage') || 'Voit valita enintään 7 päivän ajanjakson.'}
                </div>
            )}
            
            <div className="mb-2 text-sm text-zinc-400">
                {t('datepicker.selectRange') || 'Valitse enintään 7 päivän ajanjakso.'}
            </div>
            
            <DatePicker
                calendarClassName="w-full border-0 shadow-none bg-transparent"
                wrapperClassName="w-full"
                selectsRange={true}
                minDate={new Date()} // Disable dates before today
                maxDate={endDateRange}
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                isClearable={false} // Poistetaan clear-nappi, koska se vie tilaa
                renderDayContents={renderDayContents}
                monthsShown={1}
                inline
                className="w-full"
                locale={language === 'fi' ? fi : enUS}
                dayClassName={() => "text-white"}
                previousMonthButtonLabel={t('datepicker.previousMonth')}
                nextMonthButtonLabel={t('datepicker.nextMonth')}
                filterDate={isDateSelectable}
            />
            <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-500/10 rounded-sm mr-1"></div>
                    <span className="text-emerald-400">{t('datepicker.available')}</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500/10 rounded-sm mr-1"></div>
                    <span className="text-amber-400">{t('datepicker.limited')}</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-rose-500/10 rounded-sm mr-1"></div>
                    <span className="text-rose-500">{t('datepicker.booked')}</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-100/20 rounded-sm mr-1"></div>
                    <span className="text-red-300">{t('datepicker.rangeLimit')}</span>
                </div>
            </div>
            {startDate && endDate && (
                <div className="mt-3 p-2 bg-teal-500/20 border border-teal-500/30 rounded-md text-teal-400 text-sm">
                    {language === 'fi' 
                        ? (
                            <>
                                Valittu ajanjakso: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()} 
                                <br />
                                ({Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} päivää)
                            </>
                        )
                        : (
                            <>
                                Selected date range: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()} 
                                <br />
                                ({Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
                            </>
                        )
                    }
                </div>
            )}
        </div>
    );
};

export default BookingDatePicker;
