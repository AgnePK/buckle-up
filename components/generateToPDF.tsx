import jsPDF from 'jspdf';

// Function to generate a nicely formatted PDF directly
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

        // Extract basic trip data
        const title = document.querySelector('h1')?.textContent || 'Trip Itinerary';
        
        // Get dates
        const dateElements = element.querySelectorAll('.font-medium');
        let startDate = '';
        let endDate = '';
        
        dateElements.forEach(dateEl => {
            const text = dateEl.textContent || '';
            if (text.includes('Start Date:')) {
                startDate = text.replace('Start Date:', '').trim();
            } else if (text.includes('End Date:')) {
                endDate = text.replace('End Date:', '').trim();
            }
        });

        // Extract notes
        let notes = '';
        const notesHeadings = element.querySelectorAll('h2');
        notesHeadings.forEach(heading => {
            if (heading.textContent?.includes('Notes')) {
                const notesElement = heading.nextElementSibling;
                if (notesElement) {
                    notes = notesElement.textContent || '';
                }
            }
        });

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
        
        // Add notes if available
        if (notes) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            pdf.text('Notes', 20, 55);
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
            const splitNotes = pdf.splitTextToSize(notes, pageWidth - 40);
            pdf.text(splitNotes, 20, 65);
        }
        
        // Set starting Y position for itinerary
        let yPosition = notes ? 65 + (pdf.splitTextToSize(notes, pageWidth - 40).length * 7) : 60;
        yPosition += 10; // Add extra space
        
        if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
        }
        
        // Add Itinerary title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text('Itinerary Plan', 20, yPosition);
        yPosition += 10;
        
        // Process each day
        const dayDivs = element.querySelectorAll('.mb-6.bg-slate-50.p-4.rounded-md');
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
            
            // Process each period (morning, afternoon, evening)
            const periods = dayDiv.querySelectorAll('div.mb-4');
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
                    
                    // Process stops
                    const stopItems = period.querySelectorAll('.pl-4 > div');
                    for (let k = 0; k < stopItems.length; k++) {
                        const stopItem = stopItems[k];
                        const stopMainText = stopItem.querySelector('p.font-medium')?.textContent;
                        
                        if (stopMainText) {
                            // Check if we need a new page
                            if (yPosition > pageHeight - 40) {
                                pdf.addPage();
                                yPosition = 20;
                            }
                            
                            // Add stop text (remove any strange characters)
                            pdf.setFont('helvetica', 'normal');
                            pdf.setFontSize(12);
                            pdf.setTextColor(0, 0, 0);
                            
                            // Clean up text by removing any strange characters or excessive spacing
                            let cleanedText = stopMainText.replace(/ø=üí\s*-\s*/gi, '').trim();
                            cleanedText = cleanedText.replace(/\s+/g, ' '); // Fix any excessive spacing
                            
                            pdf.text(cleanedText, 30, yPosition);
                            yPosition += 6;
                            
                            // Check for notes
                            const noteText = stopItem.querySelector('.text-sm')?.textContent;
                            if (noteText) {
                                // Check if we need a new page
                                if (yPosition > pageHeight - 30) {
                                    pdf.addPage();
                                    yPosition = 20;
                                }
                                
                                // Add notes in italics
                                pdf.setFont('helvetica', 'italic');
                                pdf.setFontSize(10);
                                pdf.setTextColor(85, 85, 85); // #555 - Medium gray
                                
                                const splitNoteText = pdf.splitTextToSize(noteText, pageWidth - 70);
                                pdf.text(splitNoteText, 35, yPosition);
                                yPosition += (splitNoteText.length * 5) + 3;
                            }
                        }
                    }
                    
                    yPosition += 5; // Add space after period
                }
            }
            
            yPosition += 5; // Add space after day
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