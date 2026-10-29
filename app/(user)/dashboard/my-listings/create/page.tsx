import type {
    Metadata,
} from "next";

import CreateListingForm from "@/app/components/userComponents/listings/create/CreateListingForm";

export const metadata: Metadata = {
    title: "Create Listing | KARMASS",
    description:
        "Create a vehicle listing on KARMASS.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function CreateListingPage() {
    return (
        <main className="min-h-screen px-4 py-6 text-white sm:px-6 sm:py-10 lg:px-8">
            <CreateListingForm />
        </main>
    );
}