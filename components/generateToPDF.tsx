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
export default async function generatePDF (trip: TripType) {

    if (!trip) return;

    const htmlContent = generateItineraryHTML(trip);

    // Create a temporary div to render the HTML
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    document.body.appendChild(element);
    
    try {
        const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false
        });
        
        // Remove the temporary element
        document.body.removeChild(element);
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate dimensions to fit the content
        const width = 210; // A4 width in mm
        const height = (canvas.height * width) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(`${trip.title || 'Trip-Itinerary'}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
    }
};
