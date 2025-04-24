import React from 'react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DateRange } from "react-day-picker";
import "@/app/globals.css";

interface DateRangePickerProps {
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
    dateRange,
    onDateRangeChange
}) => {
    return (
        <div>
            <div className="grid gap-4">
                <div className="py-4">
                    {/* React-day-picker is incompatible with react19, trying to fix using AI-Claude */}
                    {/* https://github.com/shadcn-ui/ui/discussions/6271 */}
                    {/* the fix didnt work */}

                    <Calendar
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={onDateRangeChange}
                        numberOfMonths={1}
                        showOutsideDays
                        className=' pt-2 w-100'
                        styles={{
                            caption: { textAlign: 'center', marginBottom: '8px' },
                            day_selected: { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' },
                            day_range_middle: { backgroundColor: 'var(--primary)', opacity: 0.5 },
                            day_today: { fontWeight: 'bold', border: '1px solid var(--primary)' }
                        }}
                        classNames={{
                            months: "flex justify-center",
                            month: "space-y-4",
                            caption: "flex justify-center pt-1 relative items-center",
                            caption_label: "text-sm font-medium",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md focus-within:relative focus-within:z-20",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground",
                            day_range_middle: "aria-selected:bg-primary/50 aria-selected:text-foreground",
                            day_disabled: "text-muted-foreground opacity-50",
                            day_range_end: "day-range-end",
                            day_range_start: "day-range-start",
                            day_outside: "text-muted-foreground opacity-50",
                            day_hidden: "invisible",
                        }}
                    />

                </div>
                <p className="text-xs text-gray-500 italic ">
                    *The calendar is currently broken, appologies for any inconvenience
                </p>
                <Separator />

                <div className="flex gap-2 flex-row justify-between">
                    <div>
                        <p className="text-sm font-medium">From</p>
                        <p className="text-sm text-muted-foreground">
                            {dateRange?.from ? format(dateRange.from, "PPP") : "Not selected"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">To</p>
                        <p className="text-sm text-muted-foreground">
                            {dateRange?.to ? format(dateRange.to, "PPP") : "Not selected"}
                        </p>
                    </div>
                </div>
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