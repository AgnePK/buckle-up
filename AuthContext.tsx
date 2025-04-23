/**
 * Authentication context module providing global auth state and methods.
 * @module
 */
"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User, browserLocalPersistence, onAuthStateChanged, setPersistence } from "firebase/auth";
import {
    getCurrentUser,
    login,
    logout,
    register,
} from "@/firebaseServices";
import { firebase_auth } from "@/firebaseConfig";
import { useRouter } from "next/navigation";

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Authentication context interface defining available methods and state
 * for managing user authentication throughout the application.
 * @interface
 */
interface AuthContextType {
    /**
     * Authenticates an existing user with their credentials
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<User | undefined>} Authenticated user or undefined
     */
    signIn: (email: string, password: string) => Promise<User | undefined>;

    /**
     * Creates and authenticates a new user account
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @param {string} [name] - Optional user's display name
     * @returns {Promise<User | undefined>} Created user or undefined
     */
    signUp: (
        email: string,
        password: string,
        full_name: string,
    ) => Promise<User | undefined>;

    /**
     * Logs out the current user and clears session
     * @returns {void}
     */
    signOut: () => void;

    /** Currently authenticated user */
    user: User | null;
    /** Loading state for authentication operations */
    isLoading: boolean;

    /** Redirects the user to the appropriate page based on auth status */
    redirectBasedOnAuth: (redirectTo?: string) => void;

}

// ============================================================================
// Context Creation
// ============================================================================

/**
 * Authentication context instance
 * @type {React.Context<AuthContextType>}
 */
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ============================================================================
// Hook
// ============================================================================

/**
 * Custom hook to access authentication context
 * @returns {AuthContextType} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export function useSession(): AuthContextType {
    const value = useContext(AuthContext);

    if (process.env.NODE_ENV !== "production") {
        if (!Object.keys(value).length) {
            throw new Error("useSession must be wrapped in a <SessionProvider />");
        }
    }

    return value;
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * SessionProvider component that manages authentication state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function SessionProvider(props: { children: React.ReactNode }) {
    const router = useRouter();

    // ============================================================================
    // State & Hooks
    // ============================================================================

    /**
     * Current authenticated user state
     * @type {[User | null, React.Dispatch<React.SetStateAction<User | null>>]}
     */
    const [user, setUser] = useState<User | null>(null);

    /**
     * Loading state for authentication operations
     * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
     */
    const [isLoading, setIsLoading] = useState(true);

    // Error encountered when redirecting user from/to itierary :
    // ChunkLoadError: Loading chunk app/layout failed. (timeout: http://localhost:3000/_next/static/chunks/app/layout.js)
    
    // Safe redirect function that avoids React router updates during render
    const redirectBasedOnAuth = useCallback((redirectTo?: string) => {
        // Use setTimeout to push this to the next event loop iteration
        // This prevents "Cannot update component while rendering" errors
        if (redirectTo) {
            setTimeout(() => {
                router.push(redirectTo);
            }, 0);
        }
    }, [router]);

    useEffect(() => {
        const setupPersistence = async () => {
            try {
                await setPersistence(firebase_auth, browserLocalPersistence);
                console.log("Firebase persistence set to LOCAL");
            } catch (error) {
                console.error("Error setting persistence:", error);
            }
        };
        setupPersistence();
    }, []);

    // ============================================================================
    // Effects
    // ============================================================================

    /**
     * Sets up Firebase authentication state listener
     * Automatically updates user state on auth changes
     */
    useEffect(() => {
        console.log("Setting up auth state listener");

        // Auth state change listener
        const unsubscribe = onAuthStateChanged(firebase_auth, (authUser) => {
            console.log("Auth state changed:", authUser ? `User logged in: ${authUser.email}` : "No user");

            // Update state with the authenticated user
            setUser(authUser);
            setIsLoading(false);
        });

        return () => {
            console.log("Cleaning up auth state listener");
            unsubscribe();
        };
    }, []);

    // ============================================================================
    // Handlers
    // ============================================================================

    /**
     * Handles user sign-in process
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<User | undefined>} Authenticated user or undefined
     */
    const handleSignIn = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await login(email, password);
            return response?.user;
        } catch (error) {
            console.error("[handleSignIn error] ==>", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles new user registration process
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @param {string} [name] - Optional user's display name
     * @returns {Promise<User | undefined>} Created user or undefined
     */
    const handleSignUp = async (
        email: string,
        password: string,
        full_name: string,
    ) => {
        try {
            setIsLoading(true);
            const response = await register(email, password, full_name);
            return response?.user;
        } catch (error) {
            console.error("[handleSignUp error] ==>", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles user sign-out process
     * Clears local user state after successful logout
     */
    const handleSignOut = async () => {
        try {
            setIsLoading(true);
            await logout();
            redirectBasedOnAuth("/signIn");
        } catch (error) {
            console.error("[handleSignOut error] ==>", error);
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <AuthContext.Provider
            value={{
                signIn: handleSignIn,
                signUp: handleSignUp,
                signOut: handleSignOut,
                user,
                isLoading,
                redirectBasedOnAuth
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
}

// https://github.com/aaronksaunders/firebase-exporouter-app/tree/main
// this code was originally taken from the above github repo.
// later modified to suit the needs of this project
// also modified to work in NextJS instead of ReactNative