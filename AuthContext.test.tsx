import { render, screen, fireEvent, act } from '@testing-library/react';
import { SessionProvider, useSession } from '@/AuthContext';
import { login, logout, register } from "@/firebaseServices";
import { onAuthStateChanged } from "firebase/auth";

// Mock the firebase modules
jest.mock('firebase/auth', () => ({
    onAuthStateChanged: jest.fn(),
    browserLocalPersistence: 'browser',
    setPersistence: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/firebaseServices', () => ({
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn(),
}));

jest.mock('@/firebaseConfig', () => ({
    firebase_auth: {},
}));

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// A test component that uses the useSession hook
const TestComponent = () => {
    const { user, isLoading, signIn, signOut } = useSession();

    return (
        <div>
            <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
            <div data-testid="user-state">{user ? `Logged in as ${user.email}` : 'Not logged in'}</div>
            <button data-testid="login-button" onClick={() => signIn('jest@example.com', 'password')}>
                Log In
            </button>
            <button data-testid="logout-button" onClick={signOut}>
                Log Out
            </button>
        </div>
    );
};

describe('SessionProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default mock implementation for onAuthStateChanged
        (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
            // Simulate no user initially
            callback(null);
            return jest.fn(); // Return unsubscribe function
        });
    });

    test('renders without crashing', () => {
        render(
            <SessionProvider>
                <TestComponent />
            </SessionProvider>
        );

        expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
        expect(screen.getByTestId('user-state')).toHaveTextContent('Not logged in');
    });

    test('handles login correctly', async () => {
        const mockUser = { email: 'jest@example.com', uid: '123' };
        (login as jest.Mock).mockResolvedValue({ user: mockUser });

        render(
            <SessionProvider>
                <TestComponent />
            </SessionProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByTestId('login-button'));
        })
        // Check if login was called with correct parameters
        expect(login).toHaveBeenCalledWith('jest@example.com', 'password');
    });

    test('handles logout correctly', async () => {
        // Mock a logged-in user
        (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
            callback({ email: 'jest@example.com', uid: '123' });
            return jest.fn();
        });

        render(
            <SessionProvider>
                <TestComponent />
            </SessionProvider>
        );

        // Verify that we're logged in
        expect(screen.getByTestId('user-state')).toHaveTextContent('Logged in as jest@example.com');

        // Click logout button
        fireEvent.click(screen.getByTestId('logout-button'));

        // Check if logout was called
        expect(logout).toHaveBeenCalled();
    });
});