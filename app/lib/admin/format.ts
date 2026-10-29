const numberFormatter = new Intl.NumberFormat("en-NG");

export function formatNumber(value: number): string {
    return numberFormatter.format(value);
}

export function formatMoney(amount: number, currency: string): string {
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency} ${formatNumber(amount)}`;
    }
}

export function formatMegabytes(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

export function formatUptime(totalSeconds: number): string {
    const days = Math.floor(totalSeconds / 86_400);
    const hours = Math.floor((totalSeconds % 86_400) / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);

    if (days > 0) {
        return `${days}d ${hours}h`;
    }

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
}

export function timeAgo(iso: string): string {
    const seconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(iso).getTime()) / 1000),
    );

    if (seconds < 60) {
        return "just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    return `${Math.floor(hours / 24)}d ago`;
}

export function fullName(firstName?: string, lastName?: string): string {
    return `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Unnamed";
}

export function initialsOf(firstName?: string, lastName?: string): string {
    const letters = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`;

    return (letters || "?").toUpperCase();
}