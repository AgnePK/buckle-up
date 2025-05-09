"use client"
import React, { useEffect, useState } from 'react'
import { useSession } from "@/AuthContext";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

export default function SignIn() {

    const router = useRouter()
    const { signIn, redirectBasedOnAuth, user } = useSession();

    useEffect(() => {
        if (user) {
            redirectBasedOnAuth("/itinerary");
        }
    }, [user, redirectBasedOnAuth]);


    const [thisUser, setThisUser] = useState({
        email: "",
        password: ""
    })
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleChange = (e: { target: { name: string; value: string; }; }) => {
        const { name, value } = e.target;
        setThisUser(prevState => ({
            ...prevState,
            [name]: value
        }));

        if (error) setError("")
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!thisUser.email || !thisUser.password) {
            setError("All fields are required");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!thisUser.email.trim() || !emailRegex.test(thisUser.email)) {
            setError("Please enter a valid email");
            return;
        }

        // Password length validation
        if (thisUser.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        setIsSubmitting(true);
        setError("");

        try {
            await signIn(thisUser.email, thisUser.password);
            router.push("/itinerary");
        } catch (err: any) {
            console.error("Sign in error:", err);

            // Map Firebase error codes to thisUser-friendly messages
            if (err.code === "auth/invalid-credential" || err.code === "auth/invalid-email" || err.code === "auth/thisUser-not-found") {
                setError("Invalid email or password. Please check your credentials and try again.");
            } else if (err.code === "auth/wrong-password") {
                setError("Incorrect password. Please try again.");
            } else if (err.code === "auth/thisUser-disabled") {
                setError("This account has been disabled. Please contact support.");
            } else if (err.code === "auth/too-many-requests") {
                setError("Too many unsuccessful login attempts. Please try again later or reset your password.");
            } else if (err.code === "auth/network-request-failed") {
                setError("Network error. Please check your internet connection and try again.");
            } else {
                setError(err.message || "An error occurred during sign in. Please try again.");
            }

        } finally {
            setIsSubmitting(false);
        }


    };

    return (
        <div className='grid gap-8 place-content-center min-h-screen'>
            <h1 className="text-6xl text-primary font-extrabold">Buckle Up</h1>

            <form onSubmit={handleSubmit} className='grid gap-4'>
                <div className='flex gap-1 justify-self-center'>
                    <p>No account?</p>
                    <Link href={"/signUp"} className='text-emerald-700 hover:underline'>Sign Up</Link>
                </div>



                <div className='grid gap-3'>
                    <Input
                        placeholder="Email address"
                        value={thisUser.email}
                        onChange={handleChange}
                        className={` ${error && !thisUser.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        name="email"
                        type="email"
                        autoComplete="email"
                        disabled={isSubmitting}
                    />

                    <Input
                        placeholder="Password"
                        value={thisUser.password}
                        onChange={handleChange}
                        className={` ${error && !thisUser.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        name="password"
                        type='password'
                        autoComplete="current-password"
                        disabled={isSubmitting}
                    />
                    {error && (
                        <div className="text-destructive max-w-75 flex items-start align-center gap-2">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    <p className='text-sm text-slate-500 text-right hover:text-emerald-700 cursor-pointer'>Forgot password?</p>
                </div>

                <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    disabled={isSubmitting}
                    className="mt-2"
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Logging in...
                        </span>
                    ) : (
                        "Log In"
                    )}
                </Button>
            </form>
        </div>
    );
}