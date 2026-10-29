import type { LucideIcon } from "lucide-react";
import {
    Building2,
    FileCheck2,
    IdCard,
    MapPinned,
} from "lucide-react";

export interface DealerDocumentOption {
    value: string;
    label: string;
    description: string;
    icon: LucideIcon;
    required: boolean;
}

export const DEALER_DOCUMENT_TYPES: DealerDocumentOption[] = [
    {
        value: "BUSINESS_REGISTRATION",
        label: "Business registration",
        description: "Your business registration certificate, if applicable.",
        icon: Building2,
        required: false,
    },
    {
        value: "IDENTITY_DOCUMENT",
        label: "Identity document",
        description: "An accepted identity document for verification.",
        icon: IdCard,
        required: false,
    },
    {
        value: "ADDRESS_PROOF",
        label: "Proof of business address",
        description: "A document supporting your business address.",
        icon: MapPinned,
        required: false,
    },
    {
        value: "OTHER",
        label: "Other supporting document",
        description: "Any other document requested by the review team.",
        icon: FileCheck2,
        required: false,
    },
];

export const DEALER_DOCUMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp";

export const DEALER_DOCUMENT_MAX_SIZE = 5 * 1024 * 1024;