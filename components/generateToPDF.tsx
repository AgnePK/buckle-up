import jsPDF from 'jspdf';

// Function to generate a nicely formatted PDF directly from the updated layout
export const generatePDF = async () => {
    try {
        // Get the trip data from the DOM
        const element = document.getElementById('itinerary-container');
        if (!element) {
            console.error('Itinerary container element not found');
            return;
        }

        // Create a notification for user
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '9999';
        notification.textContent = 'Generating PDF, please wait...';
        document.body.appendChild(notification);

        // Extract basic trip data from the new layout
        const title = element.querySelector('h1')?.textContent || 'Trip Itinerary';

        // Get dates
        const dateText = element.querySelector('.flex.gap-4 > p')?.textContent || '';
        const dateParts = dateText.split(' to ');
        const startDate = dateParts[0] || '';
        const endDate = dateParts[1] || '';

        // Extract notes - updated for new structure
        let notes = '';
        const notesSection = element.querySelector('.whitespace-pre-wrap');
        if (notesSection) {
            notes = notesSection.textContent || '';
        }

        // Create the PDF document with custom styling
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Add header with dark emerald green background
        pdf.setFillColor(5, 102, 54); // #056636 - Dark emerald green
        pdf.rect(0, 0, pageWidth, 30, 'F');

        // Add title
        pdf.setTextColor(255, 255, 255); // White text
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(24);
        pdf.text(title, 20, 20); // Left aligned

        // Add dates
        pdf.setTextColor(0, 0, 0); // Black text
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Start Date: ${startDate}  |  End Date: ${endDate}`, 20, 40); // Left aligned

        let yPosition = 50;

        // Add notes if available
        if (notes) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            pdf.text('Notes', 20, yPosition);
            yPosition += 10;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
            const splitNotes = pdf.splitTextToSize(notes, pageWidth - 40);
            pdf.text(splitNotes, 20, yPosition);
            yPosition += (splitNotes.length * 7) + 10;
        }

        // Check if we need a new page before the itinerary
        if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
        }

        // Add Itinerary title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text('Itinerary Plan', 20, yPosition);
        yPosition += 10;

        // Process each day - updated for new layout structure
        // Changed selector to match the new layout class
        const dayDivs = element.querySelectorAll('.bg-muted\\/40 > div.mb-6');

        for (let i = 0; i < dayDivs.length; i++) {
            const dayDiv = dayDivs[i];
            const dayTitle = dayDiv.querySelector('h3')?.textContent || 'Day';

            // Check if we need a new page
            if (yPosition > pageHeight - 60) {
                pdf.addPage();
                yPosition = 20;
            }

            // Add day title with green accent
            pdf.setDrawColor(5, 102, 54); // #056636 - Dark emerald green
            pdf.setLineWidth(0.5);
            pdf.line(20, yPosition, 190, yPosition);

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            pdf.setTextColor(5, 102, 54); // Dark emerald green text for day title
            pdf.text(dayTitle, 20, yPosition + 7);
            yPosition += 15;

            // Process each time period (morning, afternoon, evening)
            const periods = dayDiv.querySelectorAll('div.ms-4');

            for (let j = 0; j < periods.length; j++) {
                const period = periods[j];
                const periodTitle = period.querySelector('h4')?.textContent;

                if (periodTitle) {
                    // Check if we need a new page
                    if (yPosition > pageHeight - 50) {
                        pdf.addPage();
                        yPosition = 20;
                    }

                    // Add period title
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(14);
                    pdf.setTextColor(52, 58, 64); // #343a40 - Dark gray
                    pdf.text(periodTitle, 25, yPosition);
                    yPosition += 8;

                    // Process timeline items (stops)
                    const stopItems = period.querySelectorAll('li');

                    for (let k = 0; k < stopItems.length; k++) {
                        const stopItem = stopItems[k];
                        const time = stopItem.querySelector('time')?.textContent || '';
                        const stopName = stopItem.querySelector('h3')?.textContent || '';
                        // Updated selector for notes text
                        const stopNotes = stopItem.querySelector('.text-base.font-normal.text-gray-500')?.textContent || '';
                        // Updated selector for address in new layout
                        const address = stopItem.querySelector('.text-sm.italic.text-gray-400')?.textContent || '';

                        // Check if we need a new page
                        if (yPosition > pageHeight - 40) {
                            pdf.addPage();
                            yPosition = 20;
                        }

                        // Add stop time and name
                        pdf.setFont('helvetica', 'normal');
                        pdf.setFontSize(12);
                        pdf.setTextColor(0, 0, 0);

                        pdf.text(`${time}: ${stopName}`, 30, yPosition);
                        yPosition += 6;

                        // Add notes if available
                        if (stopNotes) {
                            if (yPosition > pageHeight - 30) {
                                pdf.addPage();
                                yPosition = 20;
                            }

                            pdf.setFont('helvetica', 'italic');
                            pdf.setFontSize(10);
                            pdf.setTextColor(85, 85, 85); // #555 - Medium gray

                            const splitNoteText = pdf.splitTextToSize(stopNotes, pageWidth - 70);
                            pdf.text(splitNoteText, 35, yPosition);
                            yPosition += (splitNoteText.length * 5) + 3;
                        }

                        // Add address if available
                        if (address) {
                            if (yPosition > pageHeight - 30) {
                                pdf.addPage();
                                yPosition = 20;
                            }

                            pdf.setFont('helvetica', 'italic');
                            pdf.setFontSize(9);
                            pdf.setTextColor(120, 120, 120);

                            pdf.text(address, 35, yPosition);
                            yPosition += 5;
                        }

                        yPosition += 3; // Add space after each stop
                    }

                    yPosition += 5; // Add space after period
                }
            }

            yPosition += 10; // Add space after day
        }

        // Add footer with page numbers
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(10);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Page ${i} of ${totalPages}`, 20, pageHeight - 10); // Left aligned
        }

        // Get the current date for the filename
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];

        // Save the PDF
        pdf.save(`itinerary-${dateString}.pdf`);

        // Show success message
        notification.textContent = 'PDF downloaded successfully!';
        notification.style.backgroundColor = 'rgba(16, 185, 129, 0.9)'; // Emerald green success

        // Remove notification after completion
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
    }
};

export default generatePDF;