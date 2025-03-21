import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DraggableStop from '@/components/itinerary/DraggableStop';
import { StopType } from '@/types/types';

// Mock dependencies
jest.mock('react-dnd', () => ({
  useDrag: () => [{ isDragging: false }, jest.fn()],
  useDrop: () => [{ isOver: false }, jest.fn()]
}));

jest.mock('react-dnd-html5-backend', () => ({}));

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

// Mock the DndProvider by rendering children directly
jest.mock('react-dnd', () => ({
  ...jest.requireActual('react-dnd'),
  DndProvider: ({ children }: { children: React.ReactNode }) => children
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
    const input = screen.getByTestId('places-autocomplete') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    
    // Check if time is displayed
    expect(screen.getByText(/Time: 10:00 AM/)).toBeInTheDocument();
    
    // Check for buttons
    expect(screen.getByText('Set Time')).toBeInTheDocument();
    expect(screen.getByText('Add Notes')).toBeInTheDocument();
  });

  test('calls removeStop when delete button is clicked', () => {
    render(<DraggableStop {...mockProps} />);
    
    // Find and click the delete button (text content is X)
    const deleteButton = screen.getByText('X');
    fireEvent.click(deleteButton);
    
    // Check if removeStop was called with the correct parameters
    expect(mockProps.removeStop).toHaveBeenCalledWith(1, 'morning', 0);
  });

  test('calls toggleNotes when Add Notes button is clicked', () => {
    render(<DraggableStop {...mockProps} />);
    
    // Find and click the Add Notes button
    const addNotesButton = screen.getByText('Add Notes');
    fireEvent.click(addNotesButton);
    
    // Check if toggleNotes was called with the correct parameters
    expect(mockProps.toggleNotes).toHaveBeenCalledWith(1, 'morning', 0);
  });

  test('sets up time picker when Set Time button is clicked', () => {
    render(<DraggableStop {...mockProps} />);
    
    // Find and click the Set Time button
    const setTimeButton = screen.getByText('Set Time');
    fireEvent.click(setTimeButton);
    
    // Check if the correct functions were called to set up the time picker
    expect(mockProps.setSelectedDay).toHaveBeenCalledWith(1);
    expect(mockProps.setSelectedSlot).toHaveBeenCalledWith('morning');
    expect(mockProps.setSelectedEntryIndex).toHaveBeenCalledWith(0);
    expect(mockProps.setShowTimePicker).toHaveBeenCalledWith(true);
  });
});