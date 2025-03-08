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
export interface Accommodation {
	Sector?: string;
	"Account Name"?: string;
	"Property Reg Number": string;
	"Address Line 1"?: string;
	"Address City/Town"?: string;
	"Address County"?: string;
	"Eircode/Postal code": string;
	"Owner(s) as it appears on Register"?: string;
	Latitude: Float16Array;
	Longitude: Float16Array;
}
export interface Attractions {
	Name: string;
	Url: string;
	Telephone: string;
	Latitude: Float16Array;
	Longitude: Float16Array;
	Address: string;
	County: string;
	// Tags: Array<string>;
	// or
	Tags: string[];
}

export interface Events {
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
