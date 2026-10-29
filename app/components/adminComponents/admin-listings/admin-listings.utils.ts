import { AlertTriangle, CheckCircle2, Clock3, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PendingListing } from "./admin-listings.types";

export const PUBLIC_STORAGE_URL =
  process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL?.replace(/\/+$/, "");

export function formatMoney(value: string | number, currency = "NGN") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return `${currency} ${value}`;
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch { return `${currency} ${value}`; }
}

export function vehicleLabel(item: PendingListing) {
  return [item.vehicleVariant?.year, item.vehicleMake?.name, item.vehicleModel?.name,
    item.vehicleGeneration?.name, item.vehicleVariant?.name].filter(Boolean).join(" ");
}

export function canApprove(item: PendingListing) {
  return item.images.length > 0 && item.images.every(image => image.imageCheckStatus === "PASSED");
}

export function imageCounts(item: PendingListing) {
  return {
    total: item.images.length,
    passed: item.images.filter(i => i.imageCheckStatus === "PASSED").length,
    pending: item.images.filter(i => i.imageCheckStatus === "PENDING").length,
    review: item.images.filter(i => i.imageCheckStatus === "REVIEW").length,
    failed: item.images.filter(i => i.imageCheckStatus === "FAILED").length,
  };
}

export function imageStatus(status: string): { label: string; Icon: LucideIcon; className: string } {
  if (status === "PASSED") return { label: "Passed", Icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  if (status === "FAILED") return { label: "Failed", Icon: XCircle, className: "border-red-200 bg-red-50 text-red-700" };
  if (status === "REVIEW") return { label: "Needs review", Icon: AlertTriangle, className: "border-amber-200 bg-amber-50 text-amber-700" };
  return { label: "Scanning", Icon: Clock3, className: "border-sky-200 bg-sky-50 text-sky-700" };
}

export function imageUrl(objectKey: string) {
  return PUBLIC_STORAGE_URL
    ? `${PUBLIC_STORAGE_URL}/${objectKey.split("/").map(encodeURIComponent).join("/")}`
    : null;
}
