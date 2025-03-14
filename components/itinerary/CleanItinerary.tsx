import { StopType, TripType } from '@/types/types';

export const cleanItinerary = (itinerary: TripType) => {

  const cleanStop = (stop: StopType): StopType => ({
    name: stop.name ?? "",
    time: stop.time ?? "",
    notes: stop.notes ?? "",
    ...(stop.location ? { location: stop.location } : {}),
    placeId: stop.placeId || "",
    address: stop.address || ""
  });

  return {
    ...itinerary,
    days: Object.keys(itinerary.days).reduce((acc, dayKey) => {
      const day = itinerary.days[Number(dayKey)];
      acc[Number(dayKey)] = {
        morning: day.morning.map(cleanStop),
        afternoon: day.afternoon.map(cleanStop),
        evening: day.evening.map(cleanStop),
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

