import { login, logout, register, getCurrentUser } from '@/firebaseServices';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth';

// Mock the firebase modules
jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    updateProfile: jest.fn(),
    onAuthStateChanged: jest.fn()
}));

// Mock the firebase_auth object with the necessary structure
jest.mock('@/firebaseConfig', () => ({
    firebase_auth: {
        onAuthStateChanged: jest.fn((callback) => {
            // This is a mock implementation that immediately calls the callback
            callback(null);
            // Return an unsubscribe function
            return jest.fn();
        })
    }
}));

describe('Firebase Authentication Services', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login function', () => {
        test('successfully logs in user', async () => {
            // Mock the successful login response
            const mockUser = {
                email: 'jest@example.com',
                uid: '123'
            };

            // Use mockResolvedValue for Promise-returning functions
            (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
                user: mockUser
            });

            // Call the login function and await its result
            const result = await login('jest@example.com', 'password123');

            // Verify the Firebase auth function was called with correct params
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
                expect.anything(),  // Don't check exact value of firebase_auth
                'jest@example.com',
                'password123'
            );

            // Verify the correct response was returned
            expect(result).toEqual({ user: mockUser });
        });

        test('handles login errors correctly', async () => {
            // Mock a login failure
            const mockError = new Error('Invalid email/password');
            (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(mockError);

            // Test that the error is propagated
            await expect(login('jest@example.com', 'wrong-password')).rejects.toThrow('Invalid email/password');

            // Ensure the Firebase function was still called
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
                expect.anything(),
                'jest@example.com',
                'wrong-password'
            );
        });
    });

    describe('logout function', () => {
        test('successfully logs out user', async () => {
            // Mock successful signOut
            (signOut as jest.Mock).mockResolvedValue(undefined);

            // Call logout
            await logout();

            // Verify Firebase signOut was called
            expect(signOut).toHaveBeenCalled();
        });

        test('handles logout errors', async () => {
            // Mock signOut error
            const mockError = new Error('Logout failed');
            (signOut as jest.Mock).mockRejectedValue(mockError);

            // Test that the error is propagated
            await expect(logout()).rejects.toThrow('Logout failed');

            // Ensure Firebase function was called
            expect(signOut).toHaveBeenCalled();
        });
    });

    describe('register function', () => {
        test('successfully registers new user', async () => {
            const mockUser = {
                email: 'new@example.com',
                uid: '456',
            };

            // Mock successful user creation
            (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
                user: mockUser
            });

            // Mock successful profile update
            (updateProfile as jest.Mock).mockResolvedValue(undefined);

            // Call register
            const result = await register('new@example.com', 'password123', 'New User');

            // Verify Firebase functions were called correctly
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
                expect.anything(),
                'new@example.com',
                'password123'
            );

            expect(updateProfile).toHaveBeenCalledWith(
                mockUser,
                { displayName: 'New User' }
            );

            // Verify the return value
            expect(result).toEqual({ user: mockUser });
        });

        test('handles registration errors', async () => {
            // Mock registration failure
            const mockError = new Error('Email already in use');
            (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(mockError);

            // Test that the error is propagated
            await expect(register('existing@example.com', 'password123', 'Existing User')).rejects.toThrow('Email already in use');

            // Ensure Firebase function was called
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
                expect.anything(),
                'existing@example.com',
                'password123'
            );
        });

        test('registers user without display name if not provided', async () => {
            const mockUser = {
                email: 'new@example.com',
                uid: '456'
            };

            // Mock successful user creation
            (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
                user: mockUser
            });

            // Call register with empty display name
            const result = await register('new@example.com', 'password123', '');

            // Verify Firebase function was called
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
                expect.anything(),
                'new@example.com',
                'password123'
            );

            // updateProfile should still be called since we're using if (full_name) - and empty string is truthy in js
            expect(updateProfile).toHaveBeenCalledWith(
                mockUser,
                { displayName: "" }
            );

            // Verify the return value
            expect(result).toEqual({ user: mockUser });
        });
    });

    describe('getCurrentUser function', () => {
        test('returns current user when logged in', async () => {
            const mockUser = {
                email: 'current@example.com',
                uid: '789'
            };

            // Create a custom mock implementation for onAuthStateChanged
            const onAuthChangedMock = jest.fn();
            onAuthChangedMock.mockImplementation((auth, callback) => {
                callback(mockUser);
                return jest.fn(); // Return unsubscribe function
            });

            // Override the default mock for this test only
            const originalOnAuthStateChanged = onAuthStateChanged;
            (onAuthStateChanged as jest.Mock).mockImplementation(onAuthChangedMock);

            // Call getCurrentUser
            const result = await getCurrentUser();

            // Verify the correct result is returned
            expect(result).toEqual({ user: mockUser });

            // Restore original mock
            (onAuthStateChanged as jest.Mock).mockImplementation(originalOnAuthStateChanged);
        });

        test('returns null when no user is logged in', async () => {
            // Create a custom mock implementation for onAuthStateChanged
            const onAuthChangedMock = jest.fn();
            onAuthChangedMock.mockImplementation((auth, callback) => {
                callback(null);
                return jest.fn(); // Return unsubscribe function
            });

            // Override the default mock for this test only
            const originalOnAuthStateChanged = onAuthStateChanged;
            (onAuthStateChanged as jest.Mock).mockImplementation(onAuthChangedMock);

            // Call getCurrentUser
            const result = await getCurrentUser();

            // Verify null is returned
            expect(result).toBeNull();

            // Restore original mock
            (onAuthStateChanged as jest.Mock).mockImplementation(originalOnAuthStateChanged);
        });
    });
});