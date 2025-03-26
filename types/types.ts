export interface UserType {
	_id: string;
	full_name: string;
	email: string;
	password: string;
}
export interface StopType {
	name: string;
	time: string;
	notes: string;
	placeId?: string;
	location?: {
		lat: number;
		lng: number;
	};
	address?: string;
}

export interface DayType {
	morning: StopType[];
	afternoon: StopType[];
	evening: StopType[];
}

export interface TripType {
	// making the id optional to fix typescript errors due to the
	// structure of the data in firebase, do not need an id in the
	// itinerary itself, the id is an object that contains the trip
	id?: string | any;
	title: string;
	flight: {
		flight_number: string;
		departure: string;
		landing: string;
	};
	start_date: string;
	end_date: string;
	days: Record<number, DayType>; // Object where keys are day numbers
	notes: string;
}

// API REQUESTS
export interface Accommodation extends SavedItemBase {
	Sector?: string;
	"Account Name"?: string;
	"Property Reg Number": string;
	"Address Line 1"?: string;
	"Address City/Town"?: string;
	"Address County"?: string;
	"Eircode/Postal code": string;
	"Owner(s) as it appears on Register"?: string;
	Latitude: number;
	Longitude: number;
}
export interface Attractions extends SavedItemBase {
	Name: string;
	Url: string;
	Telephone: string;
	Latitude: number;
	Longitude: number;
	Address: string;
	County: string;
	Tags: string[] | string;
}

export interface Events extends SavedItemBase {
	id: string;
	name: string;
	url: string;
	member: {
		id: number;
		name: string;
		url: string;
	};
	dtstart: string;
	latitude: Float16Array;
	longitude: Float16Array;
	venue: {
		name: string;
		telephone: string;
		email: string;
		web: string;
	};
	town: {
		name: string;
	};
	area: {
		name: string;
	};
	country: {
		name: string;
	};
}

export interface DragItem {
	day: number;
	period: keyof DayType;
	index: number;
	id?: string;
}

// Define ItemTypes for drag and drop
export const ItemTypes = {
	STOP: "stop"
};

export interface SavedItemBase {
	id?: string;
	savedAt?: string;
}
