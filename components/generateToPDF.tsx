"use client"
import { TripType } from '@/types/types'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateItineraryHTML = (trip: TripType) => {

    //HTML to display in the PDF
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${trip.title || "Trip Itinerary"}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f8f9fa;
                color: #333;
                padding: 20px;
                text-align: center;
            }
            .container {
                max-width: 700px;
                margin: auto;
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                border: 1px solid #ddd;
            }
            .header {
                background-color: #007bff;
                color: white;
                padding: 15px;
                font-size: 22px;
                font-weight: bold;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
            }
            .day-container {
                margin-top: 20px;
                padding: 15px;
                background: #f1f3f5;
                border-radius: 8px;
                text-align: left;
            }
            .day-title {
                font-size: 18px;
                font-weight: bold;
                color: #007bff;
            }
            .time-section {
                margin-top: 10px;
            }
            .time-section-title {
                font-size: 16px;
                font-weight: bold;
                text-transform: capitalize;
                color: #343a40;
            }
            .stop-item {
                margin-left: 15px;
                font-size: 14px;
                padding: 5px;
                background: white;
                border-radius: 5px;
                box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
                margin-top: 5px;
            }
            .stop-notes {
                font-style: italic;
                font-size: 12px;
                color: #555;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">${trip.title || "Trip Itinerary"}</div>
  
            ${Object.entries(trip.days || {})
            .map(
                ([dayNumber, dayData]: [string, any]) => `
                <div class="day-container">
                    <div class="day-title">Day ${dayNumber}</div>
  
                    ${["morning", "afternoon", "evening"]
                        .map((timeOfDay) => {
                            const stops = dayData[timeOfDay] || [];
                            if (stops.length === 0) return "";
                            return `
                        <div class="time-section">
                            <div class="time-section-title">${timeOfDay}</div>
                            ${stops
                                    .map(
                                        (stop: any) => `
                                <div class="stop-item">
                                    📍 ${stop.name} (${stop.time})
                                    ${stop.notes ? `<div class="stop-notes">Notes: ${stop.notes}</div>` : ""}
                                </div>
                            `
                                    )
                                    .join("")}
                        </div>
                        `;
                        })
                        .join("")}
                </div>
            `
            )
            .join("")}
        </div>
    </body>
    </html>
    `;
}

// GENERATE TO PDF
export default async function generatePDF() {

    if (typeof window === "undefined") return; // Prevent execution in SSR

    const element = document.getElementById("itinerary-container"); // Replace with actual ID
    
    if (!element) {
        console.error("Element not found");
        return;
    }

    try {
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(imgData, "PNG", 10, 10, 190, 0); // Adjust size as needed
        pdf.save("itinerary.pdf");

    } catch (error) {
        console.error("Error generating PDF:", error);
        // Add a user-visible error message
        alert("Failed to generate PDF. Please try again.");
        return false;
    }
};
