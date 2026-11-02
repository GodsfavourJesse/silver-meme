import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    LoaderCircle,
    RotateCcw,
    XCircle,
} from "lucide-react";

interface PaymentStatusBadgeProps {
    status: string;
    className?: string;
}

const STATUS_CONFIG: Record<
    string,
    {
        label: string;
        className: string;
        icon: typeof CheckCircle2;
    }
> = {
    SUCCESS: {
        label: "Successful",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: CheckCircle2,
    },

    PENDING: {
        label: "Pending",
        className: "border-amber-200 bg-amber-50 text-amber-700",
        icon: Clock3,
    },

    PROCESSING: {
        label: "Processing",
        className: "border-blue-200 bg-blue-50 text-blue-700",
        icon: LoaderCircle,
    },

    FAILED: {
        label: "Failed",
        className: "border-red-200 bg-red-50 text-red-700",
        icon: XCircle,
    },

    ABANDONED: {
        label: "Abandoned",
        className: "border-gray-200 bg-gray-100 text-gray-600",
        icon: AlertCircle,
    },

    REVERSED: {
        label: "Reversed",
        className: "border-orange-200 bg-orange-50 text-orange-700",
        icon: RotateCcw,
    },
};

export default function PaymentStatusBadge({
    status,
    className = "",
}: PaymentStatusBadgeProps) {
    const normalizedStatus = status.toUpperCase();

    const config = STATUS_CONFIG[normalizedStatus] ?? {
        label: normalizedStatus.replace(/_/g, " "),
        className: "border-gray-200 bg-gray-100 text-gray-600",
        icon: AlertCircle,
    };

    const Icon = config.icon;

    return (
        <span
            className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className} ${className}`}
        >
            <Icon
                size={13}
                className={
                    normalizedStatus === "PROCESSING"
                        ? "animate-spin"
                        : ""
                }
            />

            {config.label}
        </span>
    );
}