// components/itinerary/DateRangePicker.tsx
import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateRangePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    onChange: (dates: [Date | null, Date | null]) => void;
    startDateString: string;
    endDateString: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
    startDate,
    endDate,
    onChange,
    startDateString,
    endDateString
}) => {
    return (
        <div>
            <h2 className="text-lg font-semibold mb-1">Trip Dates</h2>
            <p className="text-sm mb-1">Select the dates for your trip</p>
            <p className="text-sm text-gray-500 mb-4">This will automatically generate the days for your itinerary on the next page</p>

            <div className="calendar-container mb-6">
                <DatePicker
                    selected={startDate}
                    onChange={onChange}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    inline
                />
            </div>

            <div className="flex justify-between mb-2">
                <p className="text-sm">Start Date: {startDateString || "Not selected"}</p>
                <p className="text-sm">End Date: {endDateString || "Not selected"}</p>
            </div>
        </div>
    );
};

export default DateRangePicker;

// Function to generate itinerary days
export const generateDays = (start: string, end: string): Record<number, any> => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const numDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newDays: Record<number, any> = {};
    for (let i = 1; i <= numDays; i++) {
        newDays[i] = {
            morning: [{ name: "", time: "", notes: "" }],
            afternoon: [{ name: "", time: "", notes: "" }],
            evening: [{ name: "", time: "", notes: "" }],
        };
    }
    return newDays;
};
