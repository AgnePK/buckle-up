"use client"
import React from 'react'
import { useRouter, useParams } from 'next/navigation';

const editItinerary = () => {
    const params = useParams();
    const id = params.id as string;


    return (
        <div>editItinerary {id}</div>
    )
}

export default editItinerary