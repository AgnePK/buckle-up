"use client"
import React, { useState } from 'react'
import { useSession } from "@/AuthContext";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignUp() {
    const [newUser, setNewUser] = useState({
        full_name: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({
        full_name: "",
        email: "",
        password: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { signUp } = useSession();
    const router = useRouter();

    const validateField = (name: string, value: string): string => {
        // testing switch statements
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch
        switch (name) {
            case 'full_name':
                return !value.trim() ? "Full name is required" : "";
            case 'email':
                if (!value.trim()) return "Email is required";
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return !emailRegex.test(value) ? "Please enter a valid email address" : "";
            case 'password':
                if (!value.trim()) return "Password is required";
                return value.length < 6 ? "Password must be at least 6 characters long" : "";
            default:
                return "";
        }
    };

    const handleChange = (e: { target: { name: string; value: string; }; }) => {
        const { name, value } = e.target;
        setNewUser(prevState => ({
            ...prevState,
            [name]: value
        }));

        // Validate and update field error
        const validationError = validateField(name, value);
        setFieldErrors(prev => ({
            ...prev,
            [name]: validationError
        }));

        // Clear general error when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields before submission
        const newFieldErrors = {
            full_name: validateField('full_name', newUser.full_name),
            email: validateField('email', newUser.email),
            password: validateField('password', newUser.password)
        };

        setFieldErrors(newFieldErrors);

        // Check if any validation errors exist
        if (Object.values(newFieldErrors).some(error => error !== "")) {
            setError("Please fix the errors before continuing.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await signUp(newUser.email, newUser.password, newUser.full_name);
            router.push("/itinerary");
        } catch (err: any) {
            console.error("Sign up error:", err);

            // Map Firebase error codes to user-friendly messages
            if (err.code === "auth/email-already-in-use") {
                setError("This email is already associated with an account. Please use a different email or sign in.");
            } else if (err.code === "auth/invalid-email") {
                setError("The email address is not valid. Please check and try again.");
            } else if (err.code === "auth/weak-password") {
                setError("Your password is too weak. Please choose a stronger password.");
            } else if (err.code === "auth/network-request-failed") {
                setError("Network error. Please check your internet connection and try again.");
            } else {
                setError(err.message || "An error occurred during sign up. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='grid gap-8 place-content-center min-h-screen'>
            <h1 className="text-6xl text-primary font-extrabold">Buckle Up</h1>
            <div className='w-70 flex flex-col gap-4 text-gray-800'>
                <p>
                    No account yet? No problem!
                </p>
                <p>
                    Let's start by signing up, then you can begin to build your first itinerary!
                </p>

            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
                {error && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className='grid gap-3'>
                    <div>
                        <Input
                            placeholder="Full Name"
                            value={newUser.full_name}
                            onChange={handleChange}
                            className={`bg-gray-100 ${fieldErrors.full_name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            name="full_name"
                            autoComplete="name"
                            disabled={isSubmitting}
                        />
                        {fieldErrors.full_name && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.full_name}</p>
                        )}
                    </div>

                    <div>
                        <Input
                            placeholder="Email address"
                            value={newUser.email}
                            onChange={handleChange}
                            className={`bg-gray-100 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            name="email"
                            type='email'
                            autoComplete="email"
                            disabled={isSubmitting}
                        />
                        {fieldErrors.email && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                        )}
                    </div>

                    <div>
                        <Input
                            placeholder="Password"
                            value={newUser.password}
                            onChange={handleChange}
                            className={`bg-gray-100 ${fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            name="password"
                            type='password'
                            autoComplete="new-password"
                            disabled={isSubmitting}
                        />
                        {fieldErrors.password && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                        )}
                    </div>

                    <div className='flex gap-1 my-3'>
                        <p className='text-slate-600'>Already have an account?</p>
                        <Link href={"/signIn"} className='text-primary hover:underline'>Log In!</Link>
                    </div>
                </div>

                <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Account...
                        </span>
                    ) : (
                        "Sign Up"
                    )}
                </Button>
            </form>
        </div>
    );
}