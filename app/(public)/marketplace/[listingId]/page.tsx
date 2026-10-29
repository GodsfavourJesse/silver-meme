import { VehicleDetailsPage } from "@/app/components/userComponents/vehicle-details/VehicleDetailspage";
import type {
    Metadata,
} from "next";

export const metadata: Metadata = {
    title: "Vehicle Details | KARMASS",
    description:
        "Explore vehicle specifications, photos, seller information, and buying safety guidance on KARMASS.",
};

interface VehicleDetailsRouteProps {
    params: Promise<{
        listingId: string;
    }>;
}

export default async function VehicleDetailsRoute({
    params,
}: VehicleDetailsRouteProps) {
    const {
        listingId,
    } = await params;

    return (
        <VehicleDetailsPage
            listingId={listingId}
        />
    );
}