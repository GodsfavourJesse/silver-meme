export function isDealerAccount(
    accountType?: string | null,
): boolean {
    return accountType?.toUpperCase() === "DEALER";
}

export function getInitials(
    firstName?: string | null,
    lastName?: string | null,
): string {
    const first = firstName?.trim().charAt(0) ?? "";
    const last = lastName?.trim().charAt(0) ?? "";

    return `${first}${last}`.toUpperCase() || "K";
}

export function getDisplayName(
    firstName?: string | null,
    lastName?: string | null,
): string {
    const first = firstName?.trim() ?? "";
    const last = lastName?.trim() ?? "";

    return [first, last].filter(Boolean).join(" ") || "KARMASS member";
}