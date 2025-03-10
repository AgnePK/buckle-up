"use client"
import React, { useState } from 'react'
import { useSession } from "@/AuthContext";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

import Link from 'next/link';

export default function SignUp() {
    const [newUser, setNewUser] = useState({
        full_name: "",
        email: "",
        password: ""
    })
    const [error, setError] = useState("")
    const { signUp } = useSession();

    const handleChange = (e: { target: { name: string; value: string; }; }) => {
        const { name, value } = e.target;
        setNewUser(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const router = useRouter()
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!newUser.email || !newUser.password || !newUser.full_name) {
            setError("All fields are required");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newUser.email)) {
            setError("Please enter a valid email");
            return;
        }

        // Password length validation
        if (newUser.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            await signUp(newUser.email, newUser.password, newUser.full_name);
            router.push("/itinerary");
        } catch (err: any) {
            setError(err.message || err.code || "An error occurred during signup");
        }
    };

    // const handleSubmit = async () => {
    //     const response = await handleRegister();
    //     if (response) {
    //         router.push("/itinerary");
    //     }
    //     console.log("New user created! ", newUser)
    // };

    return (
        <div className='grid gap-8 place-content-center min-h-screen'>
            <h1 className="text-6xl text-emerald-800 font-extrabold ">Buckle Up</h1>
            <form onSubmit={handleSubmit}>
                <div className='grid grid-rows-2 gap-3'>
                    <div>
                        <Input
                            placeholder="Full Name"
                            value={newUser.full_name}
                            onChange={handleChange}
                            className='bg-slate-100'
                            name="full_name"
                        />
                    </div>
                    <div>
                        <Input
                            placeholder="Email address"
                            value={newUser.email}
                            onChange={handleChange}
                            className='bg-slate-100'
                            name="email"
                            type='email'
                        />
                    </div>
                    <div>
                        <Input
                            placeholder="Password"
                            value={newUser.password}
                            onChange={handleChange}
                            className='bg-slate-100'
                            name="password"
                            type='password'
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className='flex justify-center gap-1 my-3'>
                        <p>Already have an account?</p>
                        <Link href={"/signIn"} className='text-emerald-700'>Log In!</Link>
                    </div>
                    <Button type="submit" variant="default" size="lg">Sign Up</Button>
                </div>
            </form>
        </div>
    );
}