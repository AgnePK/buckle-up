"use client"
import React from 'react'
import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { DayType, StopType, TripType } from '@/types/types';
import "react-calendar/dist/Calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// FIREBASE
import { db } from "@/firebaseConfig"; // Import Firebase Realtime Database
import { ref, push, get, set } from "firebase/database";
import { useSession } from '@/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import DraggableStop from '@/components/itinerary/DraggableStop';
import DateRangePicker, {generateDays} from '@/components/itinerary/DateRangePicker'
import { cleanItinerary, generateMarkedDates } from '@/components/itinerary/CleanItinerary';
import { Textarea } from '@/components/ui/textarea';

const CreatePage = () => {
    const router = useRouter()
    const [step, setStep] = useState(1);
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    const [showNotes, setShowNotes] = useState<Record<string, boolean>>({});

    // Calendar functionality
    const [selectedDates, setSelectedDates] = useState<{ start: string; end: string }>({
        start: "",
        end: "",
    });
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [markedDates, setMarkedDates] = useState<Record<string, boolean>>({});

    // Time functionality
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [flightType, setFlightType] = useState<"departure" | "landing" | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<"morning" | "afternoon" | "evening" | null>(null);
    const [selectedEntryIndex, setSelectedEntryIndex] = useState<number | null>(null);



    const [itinerary, setItinerary] = useState<TripType>({
        title: "",
        flight: { flight_number: "", departure: "", landing: "" },
        start_date: "",
        end_date: "",
        days: {},
        notes: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setItinerary(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleFlightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setItinerary((prev) => ({
            ...prev,
            flight: { ...prev.flight, [name]: value }
        }));
    };

    // Update a stop in the list
    const updateStop = (day: number, timeOfDay: keyof DayType, index: number, field: keyof StopType, value: string) => {
        setItinerary((prev) => ({
            ...prev,
            days: {
                ...prev.days,
                [day]: {
                    ...prev.days[day],
                    [timeOfDay]: prev.days[day][timeOfDay].map((stop, i) =>
                        i === index ? { ...stop, [field]: value } : stop
                    ),
                },
            },
        }));
    };

    // Move a stop within the same day and period
    const moveStop = (day: number, period: keyof DayType, fromIndex: number, toIndex: number) => {
        setItinerary((prev) => {
            const stops = [...prev.days[day][period]];
            const [movedItem] = stops.splice(fromIndex, 1);
            stops.splice(toIndex, 0, movedItem);

            return {
                ...prev,
                days: {
                    ...prev.days,
                    [day]: {
                        ...prev.days[day],
                        [period]: stops,
                    },
                },
            };
        });
    };

    const addStop = (day: number, period: keyof DayType) => {
        setItinerary((prev) => {
            const updatedDays = { ...prev.days };

            if (!updatedDays[day]) {
                updatedDays[day] = { morning: [], afternoon: [], evening: [] };
            }

            updatedDays[day][period] = [...updatedDays[day][period], { name: "", time: "", notes: "" }];

            return { ...prev, days: updatedDays };
        });
    };

    // Remove a specific stop
    const removeStop = (day: number, timeOfDay: "morning" | "afternoon" | "evening", index: number) => {
        setItinerary((prev) => {
            const updatedStops = prev.days[day][timeOfDay].filter((_, i) => i !== index);
            return {
                ...prev,
                days: {
                    ...prev.days,
                    [day]: {
                        ...prev.days[day],
                        [timeOfDay]: updatedStops
                    }
                }
            };
        });
    };

    // Remove an entire day
    const removeDay = (day: number) => {
        setItinerary((prev) => {
            const updatedDays = { ...prev.days };
            delete updatedDays[day]; // Remove the selected day

            return {
                ...prev,
                days: updatedDays
            };
        });
    };


    const toggleNotes = (day: number, period: keyof DayType, index: number): void => {
        setShowNotes((prev) => {
            const key = `${day}-${period}-${index}`;
            return { ...prev, [key]: !prev[key] };
        });
    };

    const { user } = useSession();

    // Submit itinerary to Firebase
    const submitItinerary = async () => {
        if (!user) {
            console.error("User not authenticated!");
            return;
        }

        const userTripsRef = ref(db, `User/${user.uid}/trips`); // Reference the user's trips
        if (!user?.uid) {
            console.error("User UID is undefined");
            return;
        }

        try {
            // Get existing trips data
            const snapshot = await get(userTripsRef);

            // If the path doesn't exist, initialize it
            if (!snapshot.exists()) {
                await set(userTripsRef, {});
            }

            // Push the cleaned itinerary
            const cleanedItinerary = cleanItinerary(itinerary);
            const newTripRef = push(userTripsRef); // Generates a unique key for each trip
            await set(newTripRef, cleanedItinerary);

            console.log("Itinerary submitted successfully!");
            router.push("/itinerary")
        } catch (error) {
            console.error("Error submitting itinerary:", error);
        }
    };


    // Handle date selection
    const onChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);

        // Update selectedDates state for compatibility with your existing code
        setSelectedDates({
            start: start ? start.toISOString().split("T")[0] : "",
            end: end ? end.toISOString().split("T")[0] : ""
        });

        // Update markedDates when we have a complete range
        if (start && end) {
            setMarkedDates(generateMarkedDates(
                start.toISOString().split("T")[0],
                end.toISOString().split("T")[0]
            ));
        }
    };

    // Generate itinerary days when dates are selected
    useEffect(() => {
        if (selectedDates.start && selectedDates.end) {
            setItinerary((prev) => ({
                ...prev,
                start_date: selectedDates.start,
                end_date: selectedDates.end,
            }));
        }
    }, [selectedDates]);


    // Handle itinerary generation
    const handleGenerateItinerary = () => {
        if (!itinerary.start_date || !itinerary.end_date) {
            alert("Start and end dates are required.");
            return;
        }

        setItinerary((prev) => ({
            ...prev,
            days: generateDays(itinerary.start_date, itinerary.end_date),
        }));
    };

    const handleGenerateAndNext = () => {
        handleGenerateItinerary(); // Generates the itinerary
        nextStep(); // Moves to the next step
    };


    const onChangeTime = (selectedTime: Date | null) => {
        if (!selectedTime) return;

        const formattedTime = selectedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        if (flightType) {
            // If selecting a flight time (departure or landing)
            setItinerary((prev) => ({
                ...prev,
                flight: {
                    ...prev.flight,
                    [flightType]: formattedTime,
                },
            }));
            setFlightType(null);
        } else if (selectedDay !== null && selectedSlot && selectedEntryIndex !== null) {
            // Update itinerary with selected time
            updateStop(selectedDay, selectedSlot, selectedEntryIndex, "time", formattedTime);

            // Reset selection
            setSelectedDay(null);
            setSelectedSlot(null);
            setSelectedEntryIndex(null);
        }

        setShowTimePicker(false);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className='px-4 py-6 w-100 flex flex-col content-center'>
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium mb-1">Trip Name:</p>
                            <Input name="title" value={itinerary.title} onChange={handleChange} />
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-1">Flight Info:</p>
                            <Input
                                name="flight_number"
                                placeholder="Flight Number"
                                value={itinerary.flight.flight_number}
                                onChange={handleFlightChange}
                                className="mb-2"
                            />

                            <div className="flex items-center space-x-2 mb-2">
                                <p>Departure Time: {itinerary.flight.departure || "Not Set"}</p>
                                <Button
                                    onClick={() => {
                                        setFlightType("departure");
                                        setShowTimePicker(true);
                                    }}
                                    size="sm"
                                >
                                    Select
                                </Button>
                            </div>

                            <div className="flex items-center space-x-2 mb-4">
                                <p>Landing Time: {itinerary.flight.landing || "Not Set"}</p>
                                <Button
                                    onClick={() => {
                                        setFlightType("landing");
                                        setShowTimePicker(true);
                                    }}
                                    size="sm"
                                >
                                    Select
                                </Button>
                            </div>

                            {showTimePicker && (
                                <div className="mb-4 p-4 border rounded">
                                    <DatePicker
                                        selected={new Date()}
                                        onChange={onChangeTime}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        timeCaption="Time"
                                        dateFormat="h:mm aa"
                                        inline
                                    />
                                </div>
                            )}
                        </div>

                        <Button onClick={nextStep} className="w-full">Next</Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <DateRangePicker
                            startDate={startDate}
                            endDate={endDate}
                            onChange={onChange}
                            startDateString={selectedDates.start}
                            endDateString={selectedDates.end}
                        />
                        <div className="flex flex-row space-x-2 justify-between">
                            <Button onClick={prevStep} variant="outline" className="flex-1">Back</Button>
                            <Button onClick={handleGenerateAndNext} className="flex-1">Generate & Next</Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="w-120">
                        <h2 className="text-lg font-semibold mb-4">Create itinerary</h2>

                        {Object.keys(itinerary.days).length > 0 ? (
                            <div className="">
                                {Object.entries(itinerary.days).map(([day, data]) => (
                                    <div key={day} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-md font-semibold">Day {day}</h3>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeDay(Number(day))}
                                            >
                                                Remove Day
                                            </Button>
                                        </div>

                                        {["morning", "afternoon", "evening"].map((period) => (
                                            <div key={period} className="mb-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="capitalize text-sm font-medium">{period}</h4>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addStop(Number(day), period as keyof DayType)}
                                                    >
                                                        Add Stop
                                                    </Button>
                                                </div>

                                                {data[period as keyof DayType].map((stop, stopIndex) => (
                                                    <DraggableStop
                                                        key={stopIndex}
                                                        day={Number(day)}
                                                        period={period as keyof DayType}
                                                        index={stopIndex}
                                                        stop={stop}
                                                        updateStop={updateStop}
                                                        removeStop={removeStop}
                                                        toggleNotes={toggleNotes}
                                                        showNotes={showNotes}
                                                        setSelectedDay={setSelectedDay}
                                                        setSelectedSlot={setSelectedSlot}
                                                        setSelectedEntryIndex={setSelectedEntryIndex}
                                                        setShowTimePicker={setShowTimePicker}
                                                        moveStop={moveStop}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p>No days have been generated yet.</p>
                            </div>
                        )}

                        {showTimePicker && selectedDay !== null && (
                            <div className="fixed inset-0 bg-grey bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-4 rounded-lg">
                                    <h3 className="mb-2 font-medium">Select Time</h3>
                                    <DatePicker
                                        selected={new Date()}
                                        onChange={onChangeTime}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        timeCaption="Time"
                                        dateFormat="h:mm aa"
                                        inline
                                    />
                                    <div className="mt-2 flex justify-end">
                                        <Button variant="outline" onClick={() => setShowTimePicker(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-row space-x-2 justify-between">
                            <Button onClick={prevStep} variant="outline" className="flex-1">Back</Button>
                            <Button onClick={nextStep} className="flex-1">Next</Button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium mb-1">General Notes:</p>
                            <Input
                                name="notes"
                                value={itinerary.notes}
                                onChange={handleChange}
                                className="mb-4"
                            />
                        </div>

                        <div className="flex flex-row space-x-2 justify-between">
                            <Button onClick={prevStep} variant="outline" className="flex-1">Back</Button>
                            <Button onClick={submitItinerary} className="flex-1">Submit</Button>
                        </div>
                    </div>
                )}
            </div>
        </DndProvider>
    )
}

export default CreatePage