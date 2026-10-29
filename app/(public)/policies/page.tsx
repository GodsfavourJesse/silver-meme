"use client";

import { useRouter } from "next/navigation"

export default function PolicyPage() {
    const router = useRouter()

    return (
        <div>
            <button
                onClick={() => router.push("/policies/listing-images")}
            >
                <h1>Listing policy</h1>
            </button>
        </div>
    )
}