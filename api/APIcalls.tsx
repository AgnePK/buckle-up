import Papa from 'papaparse';
import { Accommodation, Attractions, Events } from "@/types/types";
import axios from "axios";
import { getDatabase, ref, get, set } from "firebase/database";
import { db } from '@/firebaseConfig';
// base URLs
const FAILTE_IRE_URL = "https://failteireland.azure-api.net/opendata-api/v2";
const SESSION_URL = "https://thesession.org/events/search?q=Ireland&format=json&perpage=50"



interface PaginatedResponse<T> {
    items: T[];
    allItems: T[];
    nextCursor?: number;
    prevCursor?: number;
}

// Function to sanitise object keys for Firebase
// error: Error: set failed: value argument  contains an invalid key (Address City/Town) in property 'bnbs.items.0'.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"
function sanitiseKeys(obj: any): any {
    if (typeof obj !== "object" || obj === null) return obj;

    const newObj: any = {};
    for (const key in obj) {
        // Replace invalid characters (., #, $, /, [, ]) with an underscore _
        const sanitizedKey = key.replace(/[.#$/[\]]/g, "_");
        newObj[sanitizedKey] = sanitiseKeys(obj[key]); // Recursively sanitize nested objects
    }
    return newObj;
}

// const db = getDatabase();
const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
// Fetching B&Bs
export async function FailteIrelandBnB(page: number, pageSize: number)
    : Promise<PaginatedResponse<Accommodation>> {

    const dataRef = ref(db, "bnbs/");
    const dataFromDB = await get(dataRef);
    const existingData = dataFromDB.val() || {};
    const lastUpdated = existingData.lastUpdated ?? 0;

    try {
        // Check if data already exists in Firebase
        if (dataFromDB.exists()) {
            if (lastUpdated > oneWeekAgo) {
                // If data is less than a week old, return it
                // console.log(existingData.items, "Using bnb cached data from Firebase");
                return displayBnBs(existingData.items, page, pageSize);
            }

        }
        // Fetch data from api and store
        const response = await axios.get(`${FAILTE_IRE_URL}/accommodation/csv`, {
            timeout: 10000, // Set a 10s timeout (prevents infinite waiting)
            responseType: "text", // Ensure response is treated as text (not JSON)
        });
        // console.log("Response Status:", response.status);
        // console.log("Response Data:", response.data);

        if (!response) {
            console.error("Error: ", response);
            throw new Error("Network error!");
        }

        // Convert CSV to JSON
        const parsedData = Papa.parse(response.data, {
            header: true, // First row as column names
            skipEmptyLines: true, // Ignore empty lines
        });
        const cleanData = parsedData.data as Accommodation[];

        // Filter the data for B&Bs
        // console.log("Parsed JSON:", cleanData.slice(0, 5)); // Log first 5 items     
        const allItems = cleanData.filter((item: Accommodation) =>
            item["Sector"]?.toLowerCase().includes("b&b") ||
            item["Account Name"]?.toLowerCase().includes("b&b") ||
            item["Account Name"]?.toLowerCase().includes("bed and breakfast") ||
            item["Account Name"]?.toLowerCase().includes("bed & breakfast")
        );

        const sanitisedData = allItems.map((item) => sanitiseKeys(item));

        // Step 3: Store fresh data in Firebase with timestamp
        await set(dataRef, {
            items: sanitisedData,
            lastUpdated: Date.now(),
        })
            .catch(error => console.error("Firebase Write Error:", error));

        // Fetch the new data from Firebase
        const updatedDataSnapshot = await get(dataRef);
        const updatedData = updatedDataSnapshot.val();

        if (!updatedData || !updatedData.items) {
            throw new Error("Failed to fetch updated data from Firebase");
        }

        // Return the new data from Firebase
        return displayBnBs(updatedData.items, page, pageSize);

    } catch (error) {
        console.error("Error fetching B&Bs:", error);
        throw error;
    }
};

// making into a separate function to not have to rewrite it 4 times
function displayBnBs(allItems: Accommodation[], page: number, pageSize: number)
    : PaginatedResponse<Accommodation> {
    const startIndex = (page - 1) * pageSize;
    const items = allItems.slice(startIndex, startIndex + pageSize);

    return {
        items,
        allItems,
        nextCursor: startIndex + pageSize < allItems.length ? page + 1 : undefined,
        prevCursor: page > 1 ? page - 1 : undefined,
    };
}

/**
 * Accommodation Items:  [{"Account Name": "Glebe House", "Address City/Town": "Mohill", "Address County": "Leitrim", "Address Line 1": "Drumkilla", "Eircode/Postal code": "N41 DH05", "Latitude": "53.94754", "Longitude": "-7.86826", "Owner(s) as it appears on Register": "Marion Maloney", "Property Reg Number": "BBL40314", "Proprietor Description": "", "Rating": "B&B - 3 Star", "Sector": "B&Bs", "Total Units": "4"}]
 * 
 */



// Fetching Attractions
export async function FailteIrelandAttractions(page: number, pageSize: number)
    : Promise<PaginatedResponse<Attractions>> {

    const dataRef = ref(db, "attractions/");
    const dataFromDB = await get(dataRef);
    const existingData = dataFromDB.val() || {};
    const lastUpdated = existingData.lastUpdated ?? 0;

    try {
        // Check if data already exists in Firebase
        if (dataFromDB.exists()) {
            if (lastUpdated > oneWeekAgo) {
                // If data is less than a week old, return it
                // console.log(existingData.items, "Using attractions stored data from Firebase");
                return displayAttractions(existingData.items, page, pageSize);
            }
        }

        const response = await axios.get(`${FAILTE_IRE_URL}/attractions/csv`, {
            timeout: 10000, // Set a 10s timeout (prevents infinite waiting)
            responseType: "text", // Ensure response is treated as text (not JSON)
        });
        if (!response) throw new Error("Network error!");

        // Convert CSV to JSON
        const parsedData = Papa.parse(response.data, {
            header: true, // First row as column names
            skipEmptyLines: true, // Ignore empty lines
        });
        const cleanData = parsedData.data as Attractions[];

        const allItems = cleanData.map((item) => ({
            ...item,
            Tags: Array.isArray(item.Tags) // If already an array, keep it as is
                ? item.Tags
                : typeof item.Tags === "string"
                ? item.Tags.split(",").map((tag: string) => tag.trim()) // Convert string to array
                : [] // Default to an empty array if Tags is missing
        }));

        const sanitisedData = allItems.map((item) => sanitiseKeys(item));

        // Step 3: Store fresh data in Firebase with timestamp
        await set(dataRef, {
            items: sanitisedData,
            lastUpdated: Date.now(),
        })
            .catch(error => console.error("Firebase Attractions Write Error:", error));

        // Fetch the new data from Firebase
        const updatedDataSnapshot = await get(dataRef);
        const updatedData = updatedDataSnapshot.val();

        if (!updatedData || !updatedData.items) {
            throw new Error("Failed to fetch updated attractions data from Firebase");
        }

        // Return the new data from Firebase
        return displayAttractions(updatedData.items, page, pageSize);

    } catch (error) {
        console.error("Error fetching Attractions:", error);
        throw error;
    }
};
function displayAttractions(allItems: Attractions[], page: number, pageSize: number)
    : PaginatedResponse<Attractions> {
    const startIndex = (page - 1) * pageSize;
    const items = allItems.slice(startIndex, startIndex + pageSize);

    return {
        items,
        allItems,
        nextCursor: startIndex + pageSize < allItems.length ? page + 1 : undefined,
        prevCursor: page > 1 ? page - 1 : undefined,
    };
}
/**
 * Attractions Items:  [{"Address": "Unit 4, 8 Grangegorman Lower, Dublin, D07 X97Y", "County": "Dublin", "Latitude": "53.351338", "Longitude": "-6.2795464", "Name": "Hungry Boba Pizzeria", "Tags": ["Activity", "Food and Drink", "Experience", "Restaurant", "Fast Food"], "Telephone": "0035316336814", "Url": "https://www.hungrybobapizzeria.ie/"}]
 */




// Fetching The Session data - Music events

export async function TheSessionEvents(page: number, pageSize: number)
    : Promise<PaginatedResponse<Events>> {

    try {
        const response = await axios.get(`${SESSION_URL}`, {
            timeout: 10000, // Set a 10s timeout (prevents infinite waiting)
            responseType: "json",
        });
        // console.log("Response Status The Session:", response.status);
        // console.log("Response Data:", response.data);

        if (!response) {
            console.error("Error: ", response);
            throw new Error("Network error!");
        }

        const allItems = response.data.events as Events[];

        // Paginating data
        const startIndex = (page - 1) * pageSize;
        const items = allItems.slice(startIndex, startIndex + pageSize);
        console.log("Events Items: ", items);

        return {
            items,
            allItems: allItems,
            nextCursor: startIndex + pageSize < allItems.length ? page + 1 : undefined,
            prevCursor: page > 1 ? page - 1 : undefined,
        };
    } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
    }
};

/** 
 * Events Items:  [{"area": {"id": 135, "name": "Derry"}, "country": {"id": 122, "name": "Northern Ireland"}, "date": "2025-02-25 13:46:55", "dtend": "2025-10-10 00:00:00", "dtstart": "2025-10-10 00:00:00", "id": 10451, "latitude": 54.99766159, "longitude": -7.31996775, "member": {"id": 1, "name": "Jeremy", "url": "https://thesession.org/members/1"}, "name": "Altan 40th Anniversary Concert", "town": {"id": 250, "name": "Derry"}, "url": "https://thesession.org/events/10451", "venue": {"email": "", "id": 11241, "name": "The Guildhall", "telephone": "", "web": "https://guildhallderry.com/"}}]
 */