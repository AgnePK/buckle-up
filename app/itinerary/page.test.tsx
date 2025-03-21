import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSession } from '@/AuthContext';
import { onValue, ref, off } from 'firebase/database';
import { useRouter } from 'next/navigation';

// Import the page component
import ItineraryPage from '@/app/itinerary/page';

// Mock the necessary modules
jest.mock('@/AuthContext', () => ({
  useSession: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn(),
  off: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: 'test-id' }),
}));

jest.mock('@/firebaseConfig', () => ({
  db: {},
}));

describe('Itinerary Page', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Setup default auth state
    (useSession as jest.Mock).mockReturnValue({
      user: { uid: 'test-user-id', displayName: 'Test User' },
      isLoading: false,
    });
  });

  test('redirects to sign in page when user is not authenticated', () => {
    // Mock auth state to simulate no user
    (useSession as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(<ItineraryPage />);
    
    // Check if router.push was called with the correct path
    expect(mockRouter.push).toHaveBeenCalledWith('/signIn');
  });

  test('displays loading state when data is loading', () => {
    // Mock auth state with loading
    (useSession as jest.Mock).mockReturnValue({
      user: { uid: 'test-user-id', displayName: 'Test User' },
      isLoading: true,
    });

    render(<ItineraryPage />);
    
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('fetches and displays trips data for authenticated user', async () => {
    // Setup mock data for trips
    const mockTrips = {
      'trip-1': {
        id: 'trip-1',
        title: 'Trip to Dublin',
        start_date: '2025-05-01',
        end_date: '2025-05-07',
        notes: 'Exciting trip to Ireland',
      },
      'trip-2': {
        id: 'trip-2',
        title: 'Weekend in Galway',
        start_date: '2025-06-15',
        end_date: '2025-06-17',
        notes: 'Relaxing weekend getaway',
      }
    };

    // Mock onValue to simulate data being fetched
    (onValue as jest.Mock).mockImplementation((ref, callback) => {
      callback({
        val: () => mockTrips,
        exists: () => true,
      });
      return jest.fn();
    });

    render(<ItineraryPage />);

    // Wait for the data to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByText('Trip to Dublin')).toBeInTheDocument();
      expect(screen.getByText('Weekend in Galway')).toBeInTheDocument();
      expect(screen.getByText(/Welcome Back, Test User/i)).toBeInTheDocument();
    });

    // Verify Firebase reference was created with the correct path
    expect(ref).toHaveBeenCalledWith({}, 'User/test-user-id/trips');
  });

  test('displays message when no trips are found', async () => {
    // Mock onValue to simulate no data
    (onValue as jest.Mock).mockImplementation((ref, callback) => {
      callback({
        val: () => null,
        exists: () => false,
      });
      return jest.fn();
    });

    render(<ItineraryPage />);

    // Check for the "no trips" message
    await waitFor(() => {
      expect(screen.getByText(/No Trips Found/i)).toBeInTheDocument();
      expect(screen.getByText(/You haven't created any trips yet/i)).toBeInTheDocument();
    });
  });
});