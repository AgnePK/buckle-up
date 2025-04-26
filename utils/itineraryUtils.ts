import { DayType, StopType, TripType } from '@/types/types';

// Update a stop in the itinerary
export const updateStop = (
  itinerary: TripType,
  day: number, 
  period: keyof DayType, 
  index: number, 
  field: keyof StopType, 
  value: string
): TripType => {
  return {
    ...itinerary,
    days: {
      ...itinerary.days,
      [day]: {
        ...itinerary.days[day],
        [period]: itinerary.days[day][period].map((stop, i) =>
          i === index ? { ...stop, [field]: value } : stop
        ),
      },
    },
  };
};

// Move a stop within the same day and period
export const moveStop = (
  itinerary: TripType,
  day: number, 
  period: keyof DayType, 
  fromIndex: number, 
  toIndex: number
): TripType => {
  const stops = [...itinerary.days[day][period]];
  const [movedItem] = stops.splice(fromIndex, 1);
  stops.splice(toIndex, 0, movedItem);

  return {
    ...itinerary,
    days: {
      ...itinerary.days,
      [day]: {
        ...itinerary.days[day],
        [period]: stops,
      },
    },
  };
};

// Add a new stop to the itinerary
export const addStop = (
  itinerary: TripType,
  day: number, 
  period: keyof DayType
): TripType => {
  const updatedDays = { ...itinerary.days };

  if (!updatedDays[day]) {
    updatedDays[day] = { morning: [], afternoon: [], evening: [] };
  }

  updatedDays[day][period] = [...updatedDays[day][period], { name: "", time: "", notes: "" }];

  return { ...itinerary, days: updatedDays };
};

// Remove a specific stop
export const removeStop = (
  itinerary: TripType,
  day: number, 
  period: keyof DayType, 
  index: number
): TripType => {
  const updatedStops = itinerary.days[day][period].filter((_, i) => i !== index);
  return {
    ...itinerary,
    days: {
      ...itinerary.days,
      [day]: {
        ...itinerary.days[day],
        [period]: updatedStops
      }
    }
  };
};

// Remove an entire day
export const removeDay = (
  itinerary: TripType,
  day: number
): TripType => {
  const updatedDays = { ...itinerary.days };
  delete updatedDays[day]; // Remove the selected day

  return {
    ...itinerary,
    days: updatedDays
  };
};

// Update a stop's location data
export const updateStopLocation = (
  itinerary: TripType,
  day: number, 
  period: keyof DayType, 
  index: number, 
  placeData: any
): TripType => {
  const updatedDays = { ...itinerary.days };

  // Make sure the day exists
  if (!updatedDays[day]) {
    updatedDays[day] = { morning: [], afternoon: [], evening: [] };
  }

  // Make sure the period array exists and has enough items
  if (!updatedDays[day][period]) {
    updatedDays[day][period] = [];
  }

  while (updatedDays[day][period].length <= index) {
    updatedDays[day][period].push({ name: "", time: "", notes: "" });
  }

  // Now update the specific stop with the place data
  updatedDays[day][period][index] = {
    ...updatedDays[day][period][index],
    name: placeData.name || "",
    address: placeData.address || "",
    placeId: placeData.placeId || "",
    location: placeData.location
  };

  return {
    ...itinerary,
    days: updatedDays
  };
};