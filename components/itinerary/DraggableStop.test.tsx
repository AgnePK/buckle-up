import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DraggableStop from '@/components/itinerary/DraggableStop';
import { StopType } from '@/types/types';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  Clock: () => <div data-testid="clock-icon" />,
  NotebookPen: () => <div data-testid="notebook-icon" />,
  X: () => <div data-testid="x-icon" />,
  GripHorizontal: () => <div data-testid="grip-icon" />
}));

// Mock the PlacesAutocomplete component
jest.mock('@/Maps/PlacesAutocomplete', () => {
  return jest.fn(({ value, onChange, onPlaceSelect, placeholder }) => (
    <input
      data-testid="places-autocomplete"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ));
});

// Mock the Maps API functions
jest.mock('@/Maps/loadMapsAPI', () => ({
  loadMapsAPI: jest.fn().mockResolvedValue(undefined),
  isGoogleMapsLoaded: jest.fn().mockReturnValue(false)
}));

describe('DraggableStop Component', () => {
  // Common props for tests
  const mockProps = {
    day: 1,
    period: 'morning' as const,
    index: 0,
    stop: {
      name: 'Test Location',
      time: '10:00 AM',
      notes: 'Test notes',
    } as StopType,
    updateStop: jest.fn(),
    removeStop: jest.fn(),
    toggleNotes: jest.fn(),
    showNotes: { '1-morning-0': false },
    setSelectedDay: jest.fn(),
    setSelectedSlot: jest.fn(),
    setSelectedEntryIndex: jest.fn(),
    setShowTimePicker: jest.fn(),
    moveStop: jest.fn(),
    updateStopLocation: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders stop details correctly', () => {
    render(<DraggableStop {...mockProps} />);
    
    // Check if location name is displayed in the input
    const input = screen.getByTestId('places-autocomplete');
    expect(input).toBeInTheDocument();
    
    // Check if time is displayed
    const timeText = screen.getByText('10:00 AM');
    expect(timeText).toBeInTheDocument();
  });

  test('calls removeStop when delete button is clicked', () => {
    render(<DraggableStop {...mockProps} />);
    
    // Find all buttons and click the one with the X icon
    const buttons = screen.getAllByRole('button');
    // Assuming the delete button is the third button (index 2) from your component structure
    const deleteButton = buttons[2]; 
    fireEvent.click(deleteButton);
    
    // Check if removeStop was called with the correct parameters
    expect(mockProps.removeStop).toHaveBeenCalledWith(1, 'morning', 0);
  });

  test('calls toggleNotes when notes button is clicked', () => {
    render(<DraggableStop {...mockProps} />);
    
    // Find all buttons and click the one with the NotebookPen icon
    const buttons = screen.getAllByRole('button');
    // Assuming the notes button is the second button (index 1) from your component structure
    const notesButton = buttons[1];
    fireEvent.click(notesButton);
    
    // Check if toggleNotes was called with the correct parameters
    expect(mockProps.toggleNotes).toHaveBeenCalledWith(1, 'morning', 0);
  });

  test('sets up time picker when time button is clicked', () => {
    render(<DraggableStop {...mockProps} />);
    
    // Find all buttons and click the one with the time text
    const buttons = screen.getAllByRole('button');
    // Assuming the time button is the first button (index 0) from your component structure
    const timeButton = buttons[0];
    fireEvent.click(timeButton);
    
    // Check if the correct functions were called to set up the time picker
    expect(mockProps.setSelectedDay).toHaveBeenCalledWith(1);
    expect(mockProps.setSelectedSlot).toHaveBeenCalledWith('morning');
    expect(mockProps.setSelectedEntryIndex).toHaveBeenCalledWith(0);
    expect(mockProps.setShowTimePicker).toHaveBeenCalledWith(true);
  });
});