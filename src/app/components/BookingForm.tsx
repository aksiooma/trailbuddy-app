// components/BookingForm.tsx
import React from 'react';


const BookingForm = () => {
    return (
        <form className="text-slate-500 dark:text-slate-400 flex flex-col space-y-4 p-6 border border-gray-300 rounded-lg">
            <input 
                type="text"
                placeholder="Full Name"
                className="border rounded py-2 px-4"
            />
            <input
                type="email"
                placeholder="Email"
                className="border rounded py-2 px-4"
            />
            <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-shadow"
            >
                Book Now
            </button>
        </form>
    );
};

export default BookingForm;