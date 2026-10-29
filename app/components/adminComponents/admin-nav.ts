// import {
//     Car,
//     CreditCard,
//     Crown,
//     LayoutDashboard,
//     MessagesSquare,
//     Rocket,
//     ScanEye,
//     Settings,
//     Store,
//     Users,
//     type LucideIcon,
// } from "lucide-react";
// import type { AdminDashboardData } from "@/app/types/admin/admin-dashboard.types";
// import { ADMIN_BASE_PATH } from "@/app/lib/admin/path";

// export interface AdminNavItem {
//     label: string;
//     href: string;
//     icon: LucideIcon;
//     badge?: (data: AdminDashboardData) => number;
// }

// export interface AdminNavGroup {
//     title: string;
//     items: AdminNavItem[];
// }

// export const ADMIN_NAV: AdminNavGroup[] = [
//     {
//         title: "Overview",
//         items: [
//             {
//                 label: "Dashboard",
//                 href: `${ADMIN_BASE_PATH}/dashboard`,
//                 icon: LayoutDashboard,
//             },
//             {
//                 label: "Users",
//                 href: `${ADMIN_BASE_PATH}/users`,
//                 icon: Users,
//             },
//         ],
//     },
//     {
//         title: "Marketplace",
//         items: [
//             {
//                 label: "Listings",
//                 href: `${ADMIN_BASE_PATH}/listings`,
//                 icon: Car,
//                 badge: (data) => data.moderation.pendingListings,
//             },
//             {
//                 label: "Dealers",
//                 href: `${ADMIN_BASE_PATH}/dealers`,
//                 icon: Store,
//                 badge: (data) => data.dealers.pendingApplications,
//             },
//             {
//                 label: "Boosts",
//                 href: `${ADMIN_BASE_PATH}/boosts`,
//                 icon: Rocket,
//                 badge: (data) => data.boosts.pendingApproval,
//             },
//             {
//                 label: "Image review",
//                 href: `${ADMIN_BASE_PATH}/image-review`,
//                 icon: ScanEye,
//                 badge: (data) => data.moderation.pendingOrReviewImages,
//             },
//         ],
//     },
//     {
//         title: "Revenue",
//         items: [
//             {
//                 label: "Payments",
//                 href: `${ADMIN_BASE_PATH}/payments`,
//                 icon: CreditCard,
//                 badge: (data) => data.refunds.pendingOrProcessing,
//             },
//             {
//                 label: "Subscriptions",
//                 href: `${ADMIN_BASE_PATH}/subscriptions`,
//                 icon: Crown,
//             },
//         ],
//     },
//     {
//         title: "System",
//         items: [
//             {
//                 label: "Messaging",
//                 href: `${ADMIN_BASE_PATH}/messaging`,
//                 icon: MessagesSquare,
//             },
//             {
//                 label: "Settings",
//                 href: `${ADMIN_BASE_PATH}/settings`,
//                 icon: Settings,
//             },
//         ],
//     },
// ];