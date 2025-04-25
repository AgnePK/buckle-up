import React from 'react';
import { TripType, StopType } from '@/types/types';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    CalendarDays,
    Clock,
    Plane,
    MapPin,
    FileText,
    Map
} from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface TripSummaryProps {
    trip: TripType;
    className?: string;
    scrollToDay?: (day: number) => void;
}

const TripSummary: React.FC<TripSummaryProps> = ({
    trip,
    className = "",
    scrollToDay
}) => {


    const formatDate = (dateString: string): string => {
        if (!dateString) return "Not set";
        try {
            const date = new Date(dateString);

            return format(date, 'MMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    const totalStops = Object.entries(trip.days || {}).reduce((total, [_, dayData]) => {
        return total + ['morning', 'afternoon', 'evening'].reduce((dayTotal, period) => {

            const stops = dayData[period as keyof typeof dayData] || [];

            return dayTotal + stops.filter((stop: StopType) => stop.name?.trim()).length;
        }, 0);
    }, 0);

    const hasFlightInfo = trip.flight?.flight_number || trip.flight?.departure || trip.flight?.landing;

    return (
        <div className={`border rounded-lg bg-white shadow-sm ${className}`}>

            <div className="p-4 bg-slate-50 rounded-t-lg border-b">
                <h3 className="font-medium text-lg">Trip Summary</h3>
                <p className="text-sm text-slate-500">Your itinerary at a glance</p>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="p-4">
                    <Accordion type="multiple" defaultValue={["trip-details"]}>


                        <AccordionItem value="trip-details">
                            <AccordionTrigger className="hover:bg-slate-50 px-2 rounded">
                                <div className="flex items-center gap-2">
                                    <FileText size={18} className="text-emerald-600" />
                                    <span>Trip Details</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-9">
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium">Trip Name</p>
                                        <p className="text-base">{trip.title || "Untitled Trip"}</p>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <CalendarDays size={16} className="text-emerald-600 shrink-0" />
                                        <p>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</p>
                                    </div>

                                    {trip.notes && (
                                        <div>
                                            <p className="text-sm font-medium">Notes</p>
                                            <p className="text-sm text-slate-700 line-clamp-3">{trip.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {hasFlightInfo && (
                            <AccordionItem value="flight-info">
                                <AccordionTrigger className="hover:bg-slate-50 px-2 rounded">
                                    <div className="flex items-center gap-2">
                                        <Plane size={18} className="text-emerald-600" />
                                        <span>Flight Information</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-9">
                                    <div className="space-y-2">
                                        {trip.flight?.flight_number && (
                                            <div>
                                                <p className="text-sm font-medium">Flight Number</p>
                                                <p className="text-base">{trip.flight.flight_number}</p>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center gap-2 mt-2">
                                            {trip.flight?.departure && (
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">Departure</p>
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={14} className="text-emerald-600" />
                                                        <p>{trip.flight.departure}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {trip.flight?.landing && (
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">Arrival</p>
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={14} className="text-emerald-600" />
                                                        <p>{trip.flight.landing}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}


                        {Object.keys(trip.days || {}).length > 0 && (
                            <AccordionItem value="itinerary">
                                <AccordionTrigger className="hover:bg-slate-50 px-2 rounded">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={18} className="text-emerald-600" />
                                        <span>Itinerary</span>
                                        {totalStops > 0 && (
                                            <Badge variant="outline" className="ml-1 bg-emerald-50">
                                                {totalStops} {totalStops === 1 ? 'stop' : 'stops'}
                                            </Badge>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <Accordion type="single" collapsible className="mt-1">
                                        {Object.entries(trip.days || {}).map(([dayNumber, dayData]) => {
                                            // Count stops for this day that have names
                                            const dayStops = ['morning', 'afternoon', 'evening'].reduce((count, period) => {
                                                const stops = dayData[period as keyof typeof dayData] || [];
                                                return count + stops.filter((stop: StopType) => stop.name?.trim()).length;
                                            }, 0);

                                            return (
                                                <AccordionItem
                                                    key={dayNumber}
                                                    value={`day-${dayNumber}`}
                                                    className="border border-slate-200 rounded-md mb-2 p-2 overflow-hidden"
                                                >
                                                    <AccordionTrigger
                                                        className="hover:bg-slate-50 px-2 py-1"
                                                        onClick={() => scrollToDay && scrollToDay(parseInt(dayNumber))}
                                                    >
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>Day {dayNumber}</span>
                                                            {dayStops > 0 && (
                                                                <Badge variant="outline" className="ml-1 text-xs bg-slate-50">
                                                                    {dayStops} {dayStops === 1 ? 'stop' : 'stops'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="px-2 pb-2">
                                                        {['morning', 'afternoon', 'evening'].map((period) => {
                                                            const stops = dayData[period as keyof typeof dayData];
                                                            if (!stops || !stops.length || !stops.some((s: StopType) => s.name?.trim())) {
                                                                return null;
                                                            }

                                                            return (
                                                                <div key={period} className="mt-2 bg-card p-2 rounded-lg">
                                                                    <p className="text-sm font-medium capitalize mb-2">{period}</p>
                                                                    <ol className="relative border-s border-gray-300 dark:border-gray-700 ml-4">
                                                                        {stops.filter((stop: StopType) => stop.name?.trim()).map((stop: StopType, idx: number) => (
                                                                            <li key={idx} className={idx !== stops.filter((s: StopType) => s.name?.trim()).length - 1 ? "mb-6 ms-4" : "ms-4"}>
                                                                                {/* Timeline dot */}
                                                                                <div className="absolute w-3 h-3 bg-primary rounded-full mt-1.5 -start-1.5 border border-white"></div>

                                                                                {/* Time marker */}
                                                                                {stop.time && (
                                                                                    <time className="mb-1 text-xs font-normal leading-none text-gray-500 flex items-center gap-1">
                                                                                        <Clock size={12} />
                                                                                        {stop.time}
                                                                                    </time>
                                                                                )}

                                                                                {/* Stop name as title */}
                                                                                <h3 className="text-md font-semibold text-gray-900 mb-2">
                                                                                    {stop.name}
                                                                                </h3>

                                                                                {/* Address with link if available */}
                                                                                {stop.address && (
                                                                                    <p className="text-xs italic text-gray-400">
                                                                                        <a
                                                                                            href={`https://www.google.com/maps?q=${encodeURIComponent(stop.address)}`}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="flex gap-1 text-emerald-500"
                                                                                        >
                                                                                            <Map size={12} className="mt-1" />
                                                                                            {stop.address}
                                                                                        </a>
                                                                                    </p>
                                                                                )}

                                                                                {/* Notes as description */}
                                                                                {stop.notes && (
                                                                                    <p className="text-xs font-normal text-gray-500 mt-2">
                                                                                        {stop.notes}
                                                                                    </p>
                                                                                )}
                                                                            </li>
                                                                        ))}
                                                                    </ol>
                                                                </div>
                                                            );
                                                        })}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            );
                                        })}
                                    </Accordion>
                                </AccordionContent>
                            </AccordionItem>
                        )}
                    </Accordion>
                </div>
            </ScrollArea>
        </div>
    );
};

export default TripSummary;