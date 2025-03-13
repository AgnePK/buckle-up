// utils/itineraryUtils.ts
import { TripType } from '@/types/types';

export const cleanItinerary = (itinerary: TripType) => {
  return {
    ...itinerary,
    days: Object.keys(itinerary.days).reduce((acc, dayKey) => {
      const day = itinerary.days[Number(dayKey)];
      acc[Number(dayKey)] = {
        morning: day.morning.map((stop: { name: string; time: string; notes: string; }) => ({
          name: stop.name ?? "",
          time: stop.time ?? "",
          notes: stop.notes ?? "",
        })),
        afternoon: day.afternoon.map((stop: { name: string; time: string; notes: string; }) => ({
          name: stop.name ?? "",
          time: stop.time ?? "",
          notes: stop.notes ?? "",
        })),
        evening: day.evening.map((stop: { name: string; time: string; notes: string; }) => ({
          name: stop.name ?? "",
          time: stop.time ?? "",
          notes: stop.notes ?? "",
        })),
      };
      return acc;
    }, {} as TripType["days"]),
  };
};

export const generateMarkedDates = (startDate: string, endDate: string) => {
  let date = new Date(startDate);
  let newMarkedDates: Record<string, boolean> = {};

  while (date <= new Date(endDate)) {
    const formattedDate = date.toISOString().split("T")[0];
    newMarkedDates[formattedDate] = true;
    date.setDate(date.getDate() + 1);
  }

  return newMarkedDates;
};

