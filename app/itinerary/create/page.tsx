"use client"
import React from 'react'
import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { DayType, StopType, TripType } from '@/types/types';
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
import DateRangePicker, { generateDays } from '@/components/itinerary/DateRangePicker'
import { cleanItinerary, generateMarkedDates } from '@/components/itinerary/CleanItinerary';
import { DateRange } from "react-day-picker";
import { format, parse } from "date-fns";
import { Bold, ChevronRight, Clock, Eye, EyeOff, Info, Italic, Plus, Trash2, Underline, X } from 'lucide-react';

import Image from 'next/image';
import landscape2 from "@/public/illustrations/landscape2.png"
import landscape3 from "@/public/illustrations/landscape3.png"
import calendar2 from "@/public/illustrations/calendar2.png"
import notes from "@/public/illustrations/notes.png"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"


import TripSummary from '@/components/itinerary/TripSummary';

const CreatePage = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    const [showNotes, setShowNotes] = useState<Record<string, boolean>>({});

    // Calendar functionality
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [markedDates, setMarkedDates] = useState<Record<string, boolean>>({});
    const [daysGenerated, setDaysGenerated] = useState(false);

    // Time functionality
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [flightType, setFlightType] = useState<"departure" | "landing" | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<"morning" | "afternoon" | "evening" | null>(null);
    const [selectedEntryIndex, setSelectedEntryIndex] = useState<number | null>(null);

    const [showSummary, setShowSummary] = useState(false);

    // Main itinerary state
    const [itinerary, setItinerary] = useState<TripType>({
        title: "",
        flight: { flight_number: "", departure: "", landing: "" },
        start_date: "",
        end_date: "",
        days: {},
        notes: "",
    });

    // Navigation state for success alert
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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


        setIsSubmitting(true);

        try {
            // Get existing trips data
            const snapshot = await get(userTripsRef);

            // If the path doesn't exist, initialise it
            if (!snapshot.exists()) {
                await set(userTripsRef, {});
            }

            // Push the cleaned itinerary
            const cleanedItinerary = cleanItinerary(itinerary);
            const newTripRef = push(userTripsRef); // Generates a unique key for each trip
            await set(newTripRef, cleanedItinerary);

            // console.log("Itinerary submitted successfully!");

            // https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating
            router.push(`/itinerary?success=true&tripName=${encodeURIComponent(itinerary.title)}`);
        } catch (error) {
            console.error("Error submitting itinerary:", error);
        }
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        if (!range) return;

        setDateRange(range);

        // Update itinerary with selected dates
        if (range.from) {
            const formattedStartDate = format(range.from, "yyyy-MM-dd");
            let formattedEndDate = "";

            if (range.to) {
                formattedEndDate = format(range.to, "yyyy-MM-dd");
                // Update markedDates
                setMarkedDates(generateMarkedDates(formattedStartDate, formattedEndDate));
            }

            // Update itinerary with selected dates
            setItinerary((prev) => ({
                ...prev,
                start_date: formattedStartDate,
                end_date: formattedEndDate,
            }));
        }
    };

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

        setDaysGenerated(true);
    };

    const handleGenerateAndNext = () => {
        if (!daysGenerated) {
            handleGenerateItinerary(); // Generates the itinerary
        }
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

    // Maps integration
    const updateStopLocation = (day: number, timeOfDay: keyof DayType, index: number, placeData: any) => {
        console.log("Updating stop location:", placeData);

        setItinerary((prev) => {
            const updatedDays = { ...prev.days };

            // Make sure the day exists
            if (!updatedDays[day]) {
                updatedDays[day] = { morning: [], afternoon: [], evening: [] };
            }

            // Make sure the period array exists and has enough items
            if (!updatedDays[day][timeOfDay]) {
                updatedDays[day][timeOfDay] = [];
            }

            while (updatedDays[day][timeOfDay].length <= index) {
                updatedDays[day][timeOfDay].push({ name: "", time: "", notes: "" });
            }

            // Now update the specific stop with the place data
            updatedDays[day][timeOfDay][index] = {
                ...updatedDays[day][timeOfDay][index],
                name: placeData.name || "",
                address: placeData.address || "",
                placeId: placeData.placeId || "",
                location: placeData.location
            };

            return {
                ...prev,
                days: updatedDays
            };
        });
    };

    const toggleSummary = () => {
        setShowSummary(!showSummary);
    };

    return (
        <DndProvider backend={HTML5Backend}>

            <div className='relative'>
                {/* Summary Toggle Button (visible in step 3 and 4) */}
                {(step === 1 ||  step === 2 || step === 3 || step === 4) && (
                    <Button
                        onClick={toggleSummary}
                        variant="outline"
                        className="fixed right-4 top-10 z-10 rounded-full w-10 h-10 flex items-center justify-center p-0"
                    >
                        {showSummary ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                )}

                {/* Main Content and Summary Side-by-side */}
                <div className="flex">
                    <div className={`mx-auto px-8 md:w-1/2`}>
                        <h1 className="text-2xl font-bold text-center mb-6">Create a new trip</h1>

                        {step === 1 && (
                            <div className="flex flex-col gap-8 my-10">
                                <div className='md:flex md:flex-row-reverse items-center justify-between gap-4 bg-card p-6 rounded-xl'>
                                    <Image src={landscape2} alt={''} width={250} className='mx-auto md:mx-0' />
                                    <div className='flex flex-col gap-4'>
                                        <p className='text-xl text-primary'>Let's create your next itinerary</p>
                                        <p>We'll guide you through planning your perfect trip, step by step. First, let's get some basic details about your adventure.
                                        </p>
                                        <p className='italic text-sm'>Do not worry about filling everything out in one go, you can edit this itinerary later and pick up right where you left!</p>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <div className='flex gap-2'>
                                        <p className=" font-medium ">Trip Name</p>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger><Info strokeWidth={1.5} size={18} /></TooltipTrigger>
                                                <TooltipContent className='w-1/2 mx-auto'>
                                                    <p>Give your trip a memorable name that captures the spirit of your adventure!
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </div>
                                    <Input
                                        name="title"
                                        value={itinerary.title}
                                        onChange={handleChange}
                                        placeholder='Name of the trip'
                                        className=' '
                                    />
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <div className='flex gap-2'>
                                        <p className=" font-medium ">Flight Information</p>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger><Info strokeWidth={1.5} size={18} /></TooltipTrigger>
                                                <TooltipContent className='w-1/4 mx-auto'>
                                                    <p>Planning to fly? Add your flight details here to keep everything in one place. Don't worry if you don't have this information yet - you can always update it later.

                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </div>
                                    <Input
                                        name="flight_number"
                                        placeholder="Flight Number"
                                        value={itinerary.flight.flight_number}
                                        onChange={handleFlightChange}
                                        className=""
                                    />

                                    <div className='flex gap-8 mt-4'>
                                        <div className=" flex flex-col gap-2">
                                            <p className='font-medium'>Departure Time </p>
                                            <Button
                                                onClick={() => {
                                                    setFlightType("departure");
                                                    setShowTimePicker(true);
                                                }}
                                                size="lg"
                                                // variant={"outline"}
                                                className='flex gap-8 bg-card text-foreground'
                                            >
                                                <p className='font-normal'>{itinerary.flight.departure || "Not Set"}</p>
                                                <Clock />
                                            </Button>
                                        </div>

                                        <div className=" flex flex-col gap-2">
                                            <p className='font-medium'>Landing Time </p>
                                            <Button
                                                onClick={() => {
                                                    setFlightType("landing");
                                                    setShowTimePicker(true);
                                                }}
                                                size="lg"
                                                // variant={"outline"}
                                                className='flex gap-8 bg-card text-foreground'
                                            >
                                                <p className='font-normal'>{itinerary.flight.landing || "Not Set"}</p>
                                                <Clock />
                                            </Button>
                                        </div>

                                    </div>

                                    {showTimePicker && (
                                        <div className="mb-4 p-4">
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
                                <div className='ms-auto '>
                                    <Button onClick={nextStep} className='w-40'>Next</Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="flex flex-col items-center  my-10 ">
                                <div className='md:flex md:flex-row-reverse items-center justify-between gap-4 bg-card p-6 rounded-xl'>
                                    <Image src={calendar2} alt={''} width={250} />
                                    <div className='flex flex-col gap-4'>
                                        <p className='text-xl text-primary'>When will your Irish adventure begin?
                                        </p>
                                        <p >
                                            Select your travel dates and we'll automatically build a template for your daily itinerary, whether it's a quick weekend getaway or a two-week journey through the Emerald Isle.
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <DateRangePicker
                                        dateRange={dateRange}
                                        onDateRangeChange={handleDateRangeChange}
                                    />


                                    <div className="flex flex-row justify-end mt-8 ">
                                        <Button onClick={prevStep} variant="outline" className="w-40 mr-2">Back</Button>
                                        <Button onClick={handleGenerateAndNext} className="w-40">
                                            {daysGenerated ? "Next" : "Generate & Next"}
                                        </Button>
                                    </div>
                                </div>



                            </div>
                        )}

                        {step === 3 && (
                            <div className=" mb-8">
                                <div className='md:flex md:flex-row-reverse items-center justify-between gap-4 bg-card p-6 rounded-xl mb-8'>
                                    <Image src={landscape3} alt={''} width={250} />
                                    <div className='flex flex-col gap-4'>
                                        <p className='text-xl text-primary'>Now the fun begins!
                                        </p>
                                        <p >
                                            Organize your trip by morning, afternoon, and evening activities. Add stops, set times, and include notes to create your perfect Irish experience. Don't worry about getting everything perfect—you can easily edit this later.
                                        </p>
                                    </div>
                                </div>
                                {Object.keys(itinerary.days).length > 0 ? (
                                    <div className="">
                                        {Object.entries(itinerary.days).map(([day, data]) => (
                                            <div key={day} className=" p-6 mb-4 border border-gray-300 rounded-xl">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-2xl font-semibold">Day {day}</h3>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeDay(Number(day))}
                                                    >
                                                        <Trash2 />
                                                        Remove Day
                                                    </Button>
                                                </div>

                                                {["morning", "afternoon", "evening"].map((period) => (
                                                    <div key={period} className="my-12 ms-4">
                                                        <div className="items-center mb-2">
                                                            <h4 className="capitalize font-medium text-lg">{period}</h4>

                                                        </div>
                                                        <div className=' bg-card rounded-xl p-4'>

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
                                                                    updateStopLocation={updateStopLocation}
                                                                />
                                                            ))}
                                                        </div>
                                                        {/* <Separator className='bg-gray-400  md:mt-4 mt-8' /> */}

                                                        <Button
                                                            size={"sm"}
                                                            variant={"outline"}
                                                            className=' m-5 '
                                                            onClick={() => addStop(Number(day), period as keyof DayType)}
                                                        >
                                                            <Plus />
                                                            <p className='font-normal'>add stop</p>
                                                        </Button>
                                                    </div>
                                                ))}

                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-red-600 text-center">
                                        <p>No days have been generated yet.</p>
                                        <p>Please go back</p>
                                    </div>
                                )}

                                {showTimePicker && selectedDay !== null && (
                                    <div className="fixed inset-0 bg-grey bg-opacity-50 flex items-center justify-center z-50">
                                        <div className="bg-white p-4 rounded-xl shadow-lg">
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
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowTimePicker(false);
                                                        setSelectedDay(null);
                                                        setSelectedSlot(null);
                                                        setSelectedEntryIndex(null);
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-row gap-2 justify-end mt-4">
                                    <Button onClick={prevStep} variant="outline" className="w-40">Back</Button>
                                    <Button onClick={nextStep} className="w-40">Next</Button>
                                </div>
                            </div>

                        )}

                        {step === 4 && (
                            <div className="flex flex-col gap-4 my-8">
                                <div className='md:flex md:flex-row-reverse items-center justify-between gap-4 bg-card p-6 rounded-xl mb-8'>
                                    <Image src={notes} alt={''} width={250} />
                                    <div className='flex flex-col gap-4'>
                                        <p className='text-xl text-primary'>Add notes about your trip
                                        </p>
                                        <p >
                                            Travel can be stressful sometimes, makes things easier by writing down everything you need!
                                        </p>
                                        <p >
                                            Come back later if you remember soemthing you need for the trip.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <div className='flex justify-between items-center me-4'>
                                        <p className="text-sm font-medium mb-1">General Notes</p>
                                        <ToggleGroup type="single" size="sm" disabled>
                                            <ToggleGroupItem value="bold" aria-label="Toggle bold">
                                                <Bold className="h-4 w-4" />
                                            </ToggleGroupItem>
                                            <ToggleGroupItem value="italic" aria-label="Toggle italic">
                                                <Italic className="h-4 w-4" />
                                            </ToggleGroupItem>
                                            <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">
                                                <Underline className="h-4 w-4" />
                                            </ToggleGroupItem>
                                        </ToggleGroup>

                                    </div>
                                    <textarea
                                        name="notes"
                                        value={itinerary.notes}
                                        onChange={handleChange}
                                        className="mb-4 w-full border border-gray-300 p-2 rounded-sm"
                                        placeholder='Add your notes here'
                                    />
                                </div>

                                <div className="flex flex-row space-x-2 justify-end">
                                    <Button onClick={prevStep} variant="outline" className="w-40">Back</Button>
                                    <Button onClick={submitItinerary} className="w-40">Submit</Button>
                                </div>
                            </div>
                        )}
                    </div>
                    {showSummary && (
                        <div className="hidden md:block fixed right-4 top-28 w-1/4 max-w-sm">
                            <TripSummary
                                trip={itinerary}
                                className="shadow-md"
                            />
                        </div>
                    )}
                    {showSummary && (
                        <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-transparent fixed bottom-0 w-full max-w-md max-h-[80vh] flex flex-col">
                                <div className="text-end pe-4 -mb-[50px] relative">
                                    {/* <h3 className="font-semibold">Trip Summary</h3> */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={toggleSummary}
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <TripSummary
                                        trip={itinerary}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DndProvider>
    )
}

export default CreatePage