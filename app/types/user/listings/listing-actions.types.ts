export type SellerListingAction =
    | "submit"
    | "restore"
    | "reactivate"
    | "sold";

export const SELLER_LISTING_ACTIONS: Record<
    SellerListingAction,
    string
> = {
    submit: "submit",
    restore: "restore",
    reactivate: "reactivate",
    sold: "sold",
};
