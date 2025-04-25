"use client"
import React from 'react'
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from 'next/navigation';
import { DayType, DragItem, ItemTypes, StopType, TripType } from '@/types/types';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// FIREBASE
import { db } from "@/firebaseConfig"; // Import Firebase Realtime Database
import { ref, get, update } from "firebase/database";
import { useSession } from '@/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bold, Calendar as CalendarIcon, ChevronRight, Clock, Eye, EyeOff, Info, Italic, Plus, Trash2, Underline, X } from 'lucide-react';

import DraggableStop from '@/components/itinerary/DraggableStop';
import DateRangePicker from '@/components/itinerary/DateRangePicker'
import { cleanItinerary, generateMarkedDates } from '@/components/itinerary/CleanItinerary';
import { DateRange } from 'react-day-picker';
import { format, parse } from "date-fns";

import Image from 'next/image';
import landscape2 from "@/public/illustrations/landscape2.png"
import landscape3 from "@/public/illustrations/landscape3.png"
import calendar2 from "@/public/illustrations/calendar2.png"
import notes from "@/public/illustrations/notes.png"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import TripSummary from '@/components/itinerary/TripSummary';
import getTimeRange from '@/components/itinerary/GetTimeRange';
import { Textarea } from '@/components/ui/textarea';
const EditPage = () => {

    const router = useRouter();
    const { user, redirectBasedOnAuth } = useSession();

    useEffect(() => {
        if (!user) {
            redirectBasedOnAuth("/signIn");
        }
    }, [user, redirectBasedOnAuth]);

    const params = useParams();
    const tripId = params.id as string;
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    const [error, setError] = useState<string | null>(null);
    const [showSummary, setShowSummary] = useState(false);

    const [itinerary, setItinerary] = useState<TripType>({
        title: "",
        flight: { flight_number: "", departure: "", landing: "" },
        start_date: "",
        end_date: "",
        days: {},
        notes: "",
    });


    // Fetch existing itinerary data
    useEffect(() => {
        const fetchItinerary = async () => {
            if (!user || !tripId) {
                console.error("User not authenticated or tripId not provided");
                router.push('/itinerary');
                return;
            }

            try {
                const tripRef = ref(db, `User/${user.uid}/trips/${tripId}`);
                const snapshot = await get(tripRef);

                if (snapshot.exists()) {
                    const tripData = snapshot.val();
                    setItinerary(tripData);

                    // Setup date states
                    if (tripData.start_date && tripData.end_date) {
                        const startDate = new Date(tripData.start_date);
                        const endDate = new Date(tripData.end_date);

                        setDateRange({
                            from: startDate,
                            to: endDate
                        });

                        setMarkedDates(generateMarkedDates(
                            tripData.start_date,
                            tripData.end_date
                        ));
                    }

                    // Pre-fill show notes state for existing entries
                    const notesState: Record<string, boolean> = {};
                    Object.entries(tripData.days).forEach(([day, dayData]: [string, any]) => {
                        ['morning', 'afternoon', 'evening'].forEach(period => {
                            dayData[period].forEach((_: any, index: number) => {
                                notesState[`${day}-${period}-${index}`] = false;
                            });
                        });
                    });
                    setShowNotes(notesState);
                } else {
                    console.error("Itinerary not found");
                    router.push('/itinerary');
                }
            } catch (error) {
                console.error("Error fetching itinerary:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItinerary();
    }, [user, tripId, router]);

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
    const updateStop = (day: number, period: keyof DayType, index: number, field: keyof StopType, value: string) => {
        setItinerary((prev) => ({
            ...prev,
            days: {
                ...prev.days,
                [day]: {
                    ...prev.days[day],
                    [period]: prev.days[day][period].map((stop, i) =>
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

    const [showNotes, setShowNotes] = useState<Record<string, boolean>>({});

    const toggleNotes = (day: number, period: keyof DayType, index: number): void => {
        setShowNotes((prev) => {
            const key = `${day}-${period}-${index}`;
            return { ...prev, [key]: !prev[key] };
        });
    };

    // Update itinerary in Firebase
    const updateItinerary = async () => {
        if (!user || !tripId) {
            console.error("User not authenticated or tripId not provided!");
            return;
        }

        const tripRef = ref(db, `User/${user.uid}/trips/${tripId}`);

        try {
            // Update with cleaned itinerary
            const cleanedItinerary = cleanItinerary(itinerary);
            await update(tripRef, cleanedItinerary);

            console.log("Itinerary updated successfully!");
            router.push("/itinerary");
        } catch (error) {
            console.error("Error updating itinerary:", error);
        }
    };

    // CALENDAR FUNCTIONALITY
    const [selectedDates, setSelectedDates] = useState<{ start: string; end: string }>({
        start: "",
        end: "",
    });

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const [markedDates, setMarkedDates] = useState<Record<string, boolean>>({});

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

    // Function to generate itinerary days
    const generateDays = (start: string, end: string): Record<number, any> => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const numDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Start with current days
        const currentDays = { ...itinerary.days };

        // Create a new days object
        const newDays: Record<number, any> = {};

        for (let i = 1; i <= numDays; i++) {
            // If the day already exists in the current itinerary, keep it
            if (currentDays[i]) {
                newDays[i] = currentDays[i];
            } else {
                // Otherwise create a new day
                newDays[i] = {
                    morning: [{ name: "", time: "", notes: "" }],
                    afternoon: [{ name: "", time: "", notes: "" }],
                    evening: [{ name: "", time: "", notes: "" }],
                };
            }
        }

        return newDays;
    };

    // Handle itinerary regeneration
    const handleRegenerateItinerary = () => {
        if (!itinerary.start_date || !itinerary.end_date) {
            setError("Start and End dates are required");
            return false;
        }

        setError(null);

        setItinerary((prev) => ({
            ...prev,
            days: generateDays(itinerary.start_date, itinerary.end_date),
        }));
        return true
    };

    const handleGenerateAndNext = () => {
        handleRegenerateItinerary(); // Regenerates the itinerary
        nextStep(); // Moves to the next step
    };

    const [showTimePicker, setShowTimePicker] = useState(false);
    const [flightType, setFlightType] = useState<"departure" | "landing" | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<"morning" | "afternoon" | "evening" | null>(null);
    const [selectedEntryIndex, setSelectedEntryIndex] = useState<number | null>(null);

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

    if (loading) {
        return (
            <div className="flex flex-col items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p>Loading itinerary...</p>
            </div>
        );
    }

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

    const handleDateRangeChange = (range: DateRange | undefined) => {
        if (!range) return;
        setError(null);

        setDateRange(range);

        // Update selectedDates state for compatibility with your existing code
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

    const toggleSummary = () => {
        setShowSummary(!showSummary);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className='relative'>
                {/* Summary Toggle Button (visible in step 3 and 4) */}
                {(step === 1 || step === 2 || step === 3 || step === 4) && (
                    <Button
                        onClick={toggleSummary}
                        variant="outline"
                        className="fixed right-4 top-10 z-10 rounded-full w-10 h-10 flex items-center justify-center p-0"
                    >
                        {showSummary ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                )}

                <div className='mx-auto px-8 md:w-1/2'>
                    <h1 className="text-2xl font-bold text-center mb-6">Edit {itinerary.title}</h1>

                    {step === 1 && (
                        <div className="flex flex-col gap-8 mb-10">
                            <div className='md:flex md:flex-row-reverse items-center justify-between gap-4 bg-card p-6 rounded'>
                                <Image src={landscape2} alt={'Trip details'} width={250} className='mx-auto md:mx-0' />
                                <div className='flex flex-col gap-4'>
                                    <p className='text-xl text-primary'>Make changes to your itinerary</p>
                                    <p>Make changes to your trip's details. You can update the trip name, flight information, dates, and activities.</p>
                                    <p className='italic text-sm'>Your changes will be saved when you complete all steps and click "Update Itinerary".</p>
                                </div>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <div className='flex gap-2'>
                                    <p className="font-medium">Trip Name</p>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger><Info strokeWidth={1.5} size={18} /></TooltipTrigger>
                                            <TooltipContent className='w-1/2 mx-auto'>
                                                <p>Give your trip a memorable name that captures the spirit of your adventure!</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                                    name="title"
                                    value={itinerary.title}
                                    onChange={handleChange}
                                    placeholder='Name of the trip'
                                />
                            </div>

                            <div className='flex flex-col gap-2'>
                                <div className='flex gap-2'>
                                    <p className="font-medium">Flight Information</p>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger><Info strokeWidth={1.5} size={18} /></TooltipTrigger>
                                            <TooltipContent className='w-1/4 mx-auto'>
                                                <p>Update your flight details to keep your trip information organized and complete.</p>
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
                                    <div className="flex flex-col gap-2">
                                        <p className='font-medium'>Departure Time</p>
                                        <Button
                                            onClick={() => {
                                                setFlightType("departure");
                                                setShowTimePicker(true);
                                            }}
                                            size="sm"
                                            variant={"outline"}
                                            className='flex gap-8 bg-card border-gray-300'
                                        >
                                            <p className='font-normal'>{itinerary.flight.departure || "Not Set"}</p>
                                            <Clock />
                                        </Button>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className='font-medium'>Landing Time</p>
                                        <Button
                                            onClick={() => {
                                                setFlightType("landing");
                                                setShowTimePicker(true);
                                            }}
                                            size="sm"
                                            variant={"outline"}
                                            className='flex gap-8 bg-card border-gray-300'
                                        >
                                            <p className='font-normal'>{itinerary.flight.landing || "Not Set"}</p>
                                            <Clock />
                                        </Button>
                                    </div>
                                </div>

                                {showTimePicker && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="bg-background p-4 rounded-xl shadow-lg flex flex-col items-center">
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
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className='ms-auto'>
                                <Button onClick={nextStep} className='w-40'>Next</Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col items-center my-10">
                            <div className='md:flex md:flex-row-reverse items-center justify-between gap-4 bg-card p-6 rounded'>
                                <Image src={calendar2} alt={'Calendar'} width={250} />
                                <div className='flex flex-col gap-4'>
                                    <p className='text-xl text-primary'>Update your travel dates</p>
                                    <p>
                                        Adjust your travel dates if needed. We'll update your itinerary template accordingly.
                                    </p>
                                    <p className='italic text-sm'>
                                        Note: Changing dates might require adjusting your daily activities.
                                    </p>
                                </div>
                            </div>
                            <div>
                                <DateRangePicker
                                    dateRange={dateRange}
                                    onDateRangeChange={handleDateRangeChange}
                                />
                                <div className="flex flex-row justify-end mt-8">
                                    <Button onClick={prevStep} variant="outline" className="w-40 mr-2">Back</Button>
                                    <Button onClick={handleGenerateAndNext} className="w-40">Update Dates & Next</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="mb-8">
                            <div className='md:flex md:flex-row-reverse items-center justify-between gap-4 bg-card p-6 rounded mb-8'>
                                <Image src={landscape3} alt={'Landscape'} width={250} />
                                <div className='flex flex-col gap-4'>
                                    <p className='text-xl text-primary'>Customize your daily activities</p>
                                    <p>
                                        Modify your trip's activities by morning, afternoon, and evening. Add or remove stops,
                                        set times, and include notes to create your perfect Irish experience.
                                    </p>
                                </div>
                            </div>

                            {Object.keys(itinerary.days).length > 0 ? (
                                <div className="">
                                    {Object.entries(itinerary.days).map(([day, data]) => (
                                        <div key={day} className="p-6 mb-4 border border-muted rounded-xl">
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
                                                    <div className='bg-card rounded-xl p-4'>
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

                                                    <Button
                                                        size={"sm"}
                                                        variant={"outline"}
                                                        className='m-5'
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
                                <div className="py-8 text-destructive text-center">
                                    <p>No days have been generated yet.</p>
                                    <p>Please go back</p>
                                </div>
                            )}

                            {showTimePicker && selectedDay !== null && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="bg-background p-4 rounded-xl shadow-lg flex flex-col items-center">
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
                                            minTime={getTimeRange(selectedSlot).minTime}
                                            maxTime={getTimeRange(selectedSlot).maxTime}
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
                            <div className='md:flex md:flex-row-reverse items-center justify-between gap-4 bg-card p-6 rounded mb-8'>
                                <Image src={notes} alt={'Notes'} width={250} />
                                <div className='flex flex-col gap-4'>
                                    <p className='text-xl text-primary'>Update trip notes</p>
                                    <p>
                                        Add or edit notes about your trip. Keep track of important information like
                                        accommodation details, emergency contacts, or special requirements.
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
                                    className="mb-4 w-full border border-muted p-2 rounded-sm"
                                    placeholder='Add your notes here'
                                    rows={5}
                                />
                            </div>

                            <div className="flex flex-row space-x-2 justify-end">
                                <Button onClick={prevStep} variant="outline" className="w-40">Back</Button>
                                <Button onClick={updateItinerary} className="w-40">Update Itinerary</Button>
                            </div>
                        </div>
                    )}
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

export default EditPage