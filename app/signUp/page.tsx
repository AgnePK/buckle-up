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
    const { signUp } = useSession();

    const handleChange = (e: { target: { name: string; value: string; }; }) => {
        const { name, value } = e.target;
        setNewUser(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleRegister = async () => {
        try {
            return await signUp(newUser.email, newUser.password, newUser.full_name);
        } catch (err) {
            console.log("[handleLogin] ==>", err);
            return null;
        }
    };

    const router = useRouter()
    const handleSubmit = async () => {
        const response = await handleRegister();
        if (response) {
            router.push("/itinerary");
        }
        console.log("New user created! ", newUser)
    };

    return (
        <div className='grid gap-8 place-content-center min-h-screen'>
            <h1 className="text-6xl text-emerald-800 font-extrabold ">Buckle Up</h1>
            <div className='grid grid-rows-2 gap-2'>
                <div>
                    {/* <Label nativeID='email'>Full Name</Label> */}
                    <Input
                        placeholder="eg. John Doe"
                        value={newUser.full_name}
                        onChange={handleChange}
                        className='bg-slate-100'
                    />
                </div>
                <div>
                    {/* {/* <Label nativeID='email'>Email</Label> */}
                    <Input
                        placeholder="eg. doej@gmail.com"
                        value={newUser.email}
                        onChange={handleChange}
                        className='bg-slate-100'

                    />
                </div>
                <div>
                    {/* {/* <Label nativeID='pw'>Password</Label> */}
                    <Input
                        placeholder="********"
                        value={newUser.password}
                        onChange={handleChange}
                        className='bg-slate-100'

                    />
                </div>
                <div className='flex justify-center gap-1'>
                    <p>Already have an account?</p>
                    <Link href={"/signIn"} className='text-emerald-700'>Log In!</Link>
                </div>

            </div>
            <Button onClick={handleSubmit} variant="default" size="lg"><p>Sign Up</p></Button>
        </div>
    );
}