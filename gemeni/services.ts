import { GoogleGenerativeAI } from "@google/generative-ai";

// https://ai.google.dev/gemini-api/docs/text-generation?lang=node

// initialising ai with key
const genAI = new GoogleGenerativeAI(
	process.env.NEXT_PUBLIC_GOOGLE_GEMENI_API_KEY || ""
);

export interface ChatMessage {
	role: "user" | "assistant";
	content: string;
}

export interface TripContext {
	title: string;
	startDate: string;
	endDate: string;
	location?: string;
	stops?: string[];
	notes?: string;
}

// Function to generate a system prompt with trip context
export function generateSystemPrompt(tripContext: TripContext): string {
	const locationInfo = tripContext.location
		? `The trip is to ${tripContext.location}.`
		: "";
	const stopsInfo =
		tripContext.stops && tripContext.stops.length > 0
			? `Places included in the itinerary: ${tripContext.stops.join(", ")}.`
			: "";

	return `You are a helpful travel assistant for a trip planning app. You're providing information about a trip " 
		${tripContext.location}" 	from ${tripContext.startDate} 
		to 	${tripContext.endDate}. 
		${locationInfo} ${stopsInfo} ${
			tripContext.notes
				? `Additional notes about the trip: ${tripContext.notes}`
				: ""
		}
			Provide helpful, concise answers about local attractions, food, weather, cultural information, and travel tips relevant to this trip.
			When asked about specific locations, focus your answers on those places.
			If you don't have specific information about a place mentioned in the question, provide general travel advice for that type of location.
		`;
}

// https://ai.google.dev/gemini-api/docs/text-generation?lang=node#chat
// Get a chat session with the Gemini model
export async function getChatSession(prompt: string) {
	try {
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
		const chat = model.startChat({
			history: [
				{
					role: "user",
					parts: [{ text: prompt }]
				},
				{
					role: "model",
					parts: [
						{
							text: "I'm your travel assistant for this trip. How can I help you today?"
						}
					]
				}
			],
			generationConfig: {
				temperature: 0.7,
				topK: 40,
				topP: 0.95,
				maxOutputTokens: 1000
			}
		});

		return chat;
	} catch (error) {
		console.error("Error initialising Gemini chat:", error);
		throw error;
	}
}

// https://ai.google.dev/gemini-api/docs/text-generation?lang=node#generate-text-from-text
// Send a message to the Gemini model and get a response
export async function sendMessage(message: string, tripContext: TripContext) {
	try {
		const systemPrompt = generateSystemPrompt(tripContext);
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

		const result = await model.generateContent([systemPrompt, message]);
		const response = result.response;
		// console.log(result.response.text());

		return response.text();
	} catch (error) {
		console.error("Error sending message to Gemini:", error);
		throw error;
	}
}
