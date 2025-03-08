"use client"
import React, { useState } from 'react'
import { useSession } from "@/AuthContext";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';

export default function SignIn() {
    const [user, setUser] = useState({
        email: "",
        password: ""
    })
    const [error, setError] = useState(null)

    const { signIn } = useSession();

    const handleChange = (e: { target: { name: string; value: string; }; }) => {
        const { name, value } = e.target;
        setUser(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleLogin = async () => {
        try {
            return await signIn(user.email, user.password)
        } catch (error) {
            console.log("[handleLogin] ==>", error);
        }
    };

    const router = useRouter()
    const handleSubmit = async () => {
        const response = await handleLogin();
        if (response) {
            router.push("/itinerary");
        }
        console.log(" Logged in! ", user)
    };

    return (
        <div className='grid gap-8 place-content-center min-h-screen'>
            <h1 className="text-6xl text-emerald-800 font-extrabold">Buckle Up</h1>
            <div className='grid grid-rows-2 gap-2 text-end'>
                <div className='flex gap-1 justify-self-center'>
                    <p>No account?</p>
                    <Link href={"/signUp"} className='text-emerald-700'>Sign Up</Link>
                </div>
                {/* <Label nativeID='email'>Email</Label> */}
                <Input
                    placeholder="Email address"
                    value={user.email}
                    onChange={handleChange}
                    className='bg-slate-100'
                    name="email"
                />
                {/* {/* <Label nativeID='pw'>Password</Label> */}
                <Input
                    placeholder="Password"
                    value={user.password}
                    onChange={handleChange}
                    className='bg-slate-100'
                    name="password"
                    type='password'
                />
                {error}
                <p className='text-sm text-slate-500'>Forgot password?</p>

            </div>
            <Button onClick={handleSubmit} variant="default" size="lg"><p>Log In</p></Button>
        </div>
    );
}