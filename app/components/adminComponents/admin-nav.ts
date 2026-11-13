import {
    Building2,
    CarFront,
    CreditCard,
    Layers3,
    LayoutDashboard,
    Rocket,
    ScanEye,
    Users,
    type LucideIcon,
} from "lucide-react";

import { ADMIN_DASHBOARD_PATH } from "@/app/lib/admin/path";

export interface AdminNavItem {
    label: string;
    shortLabel?: string;
    href: string;
    icon: LucideIcon;
    exact?: boolean;
}

export interface AdminNavGroup {
    title: string;
    items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
    {
        title: "Workspace",
        items: [
            {
                label: "Overview",
                shortLabel: "Home",
                href: ADMIN_DASHBOARD_PATH,
                icon: LayoutDashboard,
                exact: true,
            },
            {
                label: "Users",
                href: `${ADMIN_DASHBOARD_PATH}/users`,
                icon: Users,
            },
        ],
    },
    {
        title: "Marketplace",
        items: [
            {
                label: "Listings",
                href: `${ADMIN_DASHBOARD_PATH}/listings`,
                icon: CarFront,
            },
            {
                label: "Image review",
                shortLabel: "Review",
                href: `${ADMIN_DASHBOARD_PATH}/image-review`,
                icon: ScanEye,
            },
            {
                label: "Dealers",
                href: `${ADMIN_DASHBOARD_PATH}/dealers`,
                icon: Building2,
            },
            {
                label: "Boosts",
                href: `${ADMIN_DASHBOARD_PATH}/boosts`,
                icon: Rocket,
            },
        ],
    },
    {
        title: "Revenue",
        items: [
            {
                label: "Subscriptions",
                href: `${ADMIN_DASHBOARD_PATH}/subscriptions`,
                icon: CreditCard,
                exact: true,
            },
            {
                label: "Subscription plans",
                href: `${ADMIN_DASHBOARD_PATH}/subscriptions/plans`,
                icon: Layers3,
            },
        ],
    },
];

export const ADMIN_MOBILE_PRIMARY = [
    ADMIN_NAV_GROUPS[0].items[0],
    ADMIN_NAV_GROUPS[0].items[1],
    ADMIN_NAV_GROUPS[1].items[0],
    ADMIN_NAV_GROUPS[1].items[1],
];
