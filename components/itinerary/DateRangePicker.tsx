// components/itinerary/DateRangePicker.tsx
import React from 'react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
    dateRange,
    onDateRangeChange
}) => {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg">Trip Dates</CardTitle>
                <p className="text-sm text-gray-500">
                    Select the dates for your trip. This will automatically generate the days for your itinerary.
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={onDateRangeChange}
                        numberOfMonths={1}
                        className="rounded-md border"
                    />

                    <Separator />

                
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <div>
                            <p className="text-sm font-medium">Start Date</p>
                            <p className="text-sm text-muted-foreground">
                                {dateRange?.from ? format(dateRange.from, "PPP") : "Not selected"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">End Date</p>
                            <p className="text-sm text-muted-foreground">
                                {dateRange?.to ? format(dateRange.to, "PPP") : "Not selected"}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
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
