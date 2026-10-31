"use client";

import type { ElementType, ReactNode } from "react";

import {
    Activity,
    CalendarDays,
    CarFront,
    CheckCircle2,
    FileImage,
    Fingerprint,
    History,
    Info,
    ShieldCheck,
    UserRound,
    XCircle,
} from "lucide-react";

import { AdminImageReviewStatus } from "./AdminImageReviewStatus";

import {
    formatReviewDate,
    truncateId,
} from "./imageReview.utils";

import type {
    AdminImageAnalysis,
    AdminImageReviewDetailResponse,
} from "@/app/types/admin/adminImageReview.types";

type ImageDetails = AdminImageReviewDetailResponse["image"];
type ListingDetails = AdminImageReviewDetailResponse["listing"];
type VehicleDetails = AdminImageReviewDetailResponse["vehicle"];
type SellerDetails = AdminImageReviewDetailResponse["seller"];

interface Props {
    image: ImageDetails;
    listing: ListingDetails;
    vehicle: VehicleDetails;
    seller: SellerDetails;
    analysis: AdminImageAnalysis;
    reviewHistory: AdminImageReviewDetailResponse["reviewHistory"];
}

/* -------------------------------------------------------------------------- */
/* Shared components                                                          */
/* -------------------------------------------------------------------------- */

function Section({
    title,
    icon: Icon,
    description,
    children,
}: {
    title: string;
    icon: ElementType;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1491FF]/10 text-[#1491FF]">
                    <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900">
                        {title}
                    </h3>

                    {description && (
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="p-4 sm:p-5">
                {children}
            </div>
        </section>
    );
}

function MetadataRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: ReactNode;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 first:pt-0 last:border-0 last:pb-0">
            <span className="shrink-0 text-xs font-medium text-slate-500">
                {label}
            </span>

            <span
                className={`max-w-[68%] break-words text-right text-xs font-semibold text-slate-800 ${
                    mono ? "font-mono" : ""
                }`}
            >
                {value ?? "—"}
            </span>
        </div>
    );
}

function InfoBadge({
    children,
    variant = "default",
}: {
    children: ReactNode;
    variant?: "default" | "success" | "danger" | "warning";
}) {
    const styles = {
        default: "border-slate-200 bg-slate-50 text-slate-600",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        danger: "border-red-200 bg-red-50 text-red-700",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
    };

    return (
        <span
            className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-bold ${styles[variant]}`}
        >
            {children}
        </span>
    );
}

function UnavailableInformation({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-semibold text-amber-800">
                {title}
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
                {description}
            </p>
        </div>
    );
}

function formatPrice(
    price: string | number | null | undefined,
    currency = "NGN",
) {
    if (price === null || price === undefined || price === "") {
        return "Price unavailable";
    }

    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return String(price);
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toLocaleString("en-NG")}`;
    }
}

function formatLocation(
    city?: string | null,
    state?: string | null,
    country?: string | null,
) {
    return [city, state, country]
        .filter(Boolean)
        .join(", ") || "Location unavailable";
}

function formatName(
    firstName?: string | null,
    lastName?: string | null,
) {
    return [firstName, lastName]
        .filter(Boolean)
        .join(" ") || "Name unavailable";
}

function getListingStatusVariant(
    status?: string | null,
): "default" | "success" | "danger" | "warning" {
    switch (status?.toUpperCase()) {
        case "PUBLISHED":
        case "ACTIVE":
            return "success";

        case "REJECTED":
        case "SUSPENDED":
        case "EXPIRED":
            return "danger";

        case "PENDING":
        case "UNDER_REVIEW":
        case "DRAFT":
            return "warning";

        default:
            return "default";
    }
}

function getSellerStatusVariant(
    status?: string | null,
): "default" | "success" | "danger" | "warning" {
    switch (status?.toUpperCase()) {
        case "ACTIVE":
        case "VERIFIED":
            return "success";

        case "SUSPENDED":
        case "BANNED":
        case "DISABLED":
            return "danger";

        case "PENDING":
        case "INACTIVE":
            return "warning";

        default:
            return "default";
    }
}

/* -------------------------------------------------------------------------- */
/* Listing information                                                        */
/* -------------------------------------------------------------------------- */

function ListingInformation({
    listing,
}: {
    listing: ListingDetails;
}) {
    if (!listing) {
        return (
            <Section
                title="Listing information"
                icon={FileImage}
                description="The vehicle listing associated with this image."
            >
                <UnavailableInformation
                    title="Listing information unavailable"
                    description="The associated listing could not be found or is no longer available."
                />
            </Section>
        );
    }

    return (
        <Section
            title="Listing information"
            icon={FileImage}
            description="Vehicle listing details associated with this uploaded image."
        >
            <div className="mb-4 rounded-xl border border-[#1491FF]/15 bg-[#1491FF]/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1491FF]">
                            Listing title
                        </p>

                        <h4 className="mt-1 break-words text-sm font-bold leading-6 text-slate-900">
                            {listing.title || "Untitled listing"}
                        </h4>

                        <p className="mt-2 font-mono text-[10px] text-slate-500">
                            ID: {truncateId(listing.id)}
                        </p>
                    </div>

                    <InfoBadge
                        variant={getListingStatusVariant(listing.status)}
                    >
                        {listing.status?.replaceAll("_", " ") || "UNKNOWN"}
                    </InfoBadge>
                </div>

                <div className="mt-4 border-t border-[#1491FF]/10 pt-4">
                    <p className="text-[10px] font-medium text-slate-500">
                        Asking price
                    </p>

                    <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
                        {formatPrice(listing.price, listing.currency)}
                    </p>
                </div>
            </div>

            <div className="space-y-0">
                <MetadataRow
                    label="Listing ID"
                    value={truncateId(listing.id)}
                    mono
                />

                <MetadataRow
                    label="Currency"
                    value={listing.currency}
                />

                <MetadataRow
                    label="Condition"
                    value={listing.condition}
                />

                <MetadataRow
                    label="Mileage"
                    value={
                        listing.mileage !== null &&
                        listing.mileage !== undefined
                            ? `${Number(listing.mileage).toLocaleString("en-NG")} km`
                            : "Not specified"
                    }
                />

                <MetadataRow
                    label="Location"
                    value={formatLocation(
                        listing.city,
                        listing.state,
                        listing.country,
                    )}
                />

                <MetadataRow
                    label="Views"
                    value={
                        listing.viewCount !== null &&
                        listing.viewCount !== undefined
                            ? Number(listing.viewCount).toLocaleString("en-NG")
                            : "—"
                    }
                />

                <MetadataRow
                    label="Published"
                    value={
                        listing.publishedAt
                            ? formatReviewDate(listing.publishedAt)
                            : "Not published"
                    }
                />

                <MetadataRow
                    label="Expires"
                    value={
                        listing.expiresAt
                            ? formatReviewDate(listing.expiresAt)
                            : "—"
                    }
                />

                <MetadataRow
                    label="Created"
                    value={formatReviewDate(listing.createdAt)}
                />

                <MetadataRow
                    label="Last updated"
                    value={formatReviewDate(listing.updatedAt)}
                />
            </div>

            {listing.description && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Description
                    </p>

                    <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-6 text-slate-600">
                        {listing.description}
                    </p>
                </div>
            )}

            {listing.rejectionReason && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                    <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />

                        <p className="text-xs font-bold text-red-700">
                            Listing rejection reason
                        </p>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-red-600">
                        {listing.rejectionReason}
                    </p>
                </div>
            )}
        </Section>
    );
}

/* -------------------------------------------------------------------------- */
/* Vehicle information                                                        */
/* -------------------------------------------------------------------------- */

function VehicleInformation({
    vehicle,
}: {
    vehicle: VehicleDetails;
}) {
    if (!vehicle) {
        return (
            <Section
                title="Vehicle specifications"
                icon={CarFront}
                description="Vehicle details connected to the listing."
            >
                <UnavailableInformation
                    title="Vehicle specifications unavailable"
                    description="Vehicle information could not be retrieved for this listing."
                />
            </Section>
        );
    }

    const vehicleName = [
        vehicle.year,
        vehicle.makeName,
        vehicle.modelName,
        vehicle.variantName,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Section
            title="Vehicle specifications"
            icon={CarFront}
            description="Catalog information and technical specifications of the vehicle."
        >
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Vehicle
                </p>

                <h4 className="mt-1 break-words text-base font-extrabold leading-6 text-slate-900">
                    {vehicleName || "Vehicle details unavailable"}
                </h4>

                {vehicle.generationName && (
                    <p className="mt-1 text-xs text-slate-500">
                        {vehicle.generationName}
                    </p>
                )}
            </div>

            <div className="space-y-0">
                <MetadataRow label="Make" value={vehicle.makeName} />
                <MetadataRow label="Model" value={vehicle.modelName} />
                <MetadataRow label="Generation" value={vehicle.generationName} />
                <MetadataRow label="Variant" value={vehicle.variantName} />
                <MetadataRow label="Year" value={vehicle.year} />
                <MetadataRow label="Fuel type" value={vehicle.fuelType} />
                <MetadataRow label="Transmission" value={vehicle.transmission} />
                <MetadataRow label="Drive type" value={vehicle.driveType} />
                <MetadataRow label="Body style" value={vehicle.bodyStyle} />
                <MetadataRow label="Engine" value={vehicle.engineName} />

                <MetadataRow
                    label="Engine displacement"
                    value={
                        vehicle.engineDisplacementCc !== null &&
                        vehicle.engineDisplacementCc !== undefined
                            ? `${Number(vehicle.engineDisplacementCc).toLocaleString("en-NG")} cc`
                            : "—"
                    }
                />

                <MetadataRow
                    label="Horsepower"
                    value={
                        vehicle.horsepower !== null &&
                        vehicle.horsepower !== undefined
                            ? `${vehicle.horsepower} hp`
                            : "—"
                    }
                />

                <MetadataRow label="Seats" value={vehicle.seats} />
                <MetadataRow label="Doors" value={vehicle.doors} />

                <MetadataRow
                    label="Variant ID"
                    value={truncateId(vehicle.variantId)}
                    mono
                />

                <MetadataRow
                    label="Generation ID"
                    value={truncateId(vehicle.generationId)}
                    mono
                />

                <MetadataRow
                    label="Model ID"
                    value={truncateId(vehicle.modelId)}
                    mono
                />

                <MetadataRow
                    label="Make ID"
                    value={truncateId(vehicle.makeId)}
                    mono
                />
            </div>
        </Section>
    );
}

/* -------------------------------------------------------------------------- */
/* Seller information                                                         */
/* -------------------------------------------------------------------------- */

function SellerInformation({
    seller,
}: {
    seller: SellerDetails;
}) {
    if (!seller) {
        return (
            <Section
                title="Seller information"
                icon={UserRound}
                description="Account details of the person who uploaded this listing."
            >
                <UnavailableInformation
                    title="Seller information unavailable"
                    description="The seller account could not be retrieved."
                />
            </Section>
        );
    }

    const sellerName =
        seller.fullName ||
        formatName(seller.firstName, seller.lastName);

    return (
        <Section
            title="Seller information"
            icon={UserRound}
            description="Account details of the person who uploaded this listing."
        >
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1491FF]/10 text-[#1491FF]">
                    {seller.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={seller.avatarUrl}
                            alt={sellerName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <UserRound className="h-5 w-5" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-bold text-slate-900">
                        {sellerName}
                    </h4>

                    <p className="mt-1 truncate text-xs text-slate-500">
                        {seller.email || seller.phone || "No contact information"}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                        <InfoBadge
                            variant={getSellerStatusVariant(seller.status)}
                        >
                            {seller.status?.replaceAll("_", " ") || "UNKNOWN"}
                        </InfoBadge>

                        <InfoBadge>
                            {seller.accountType?.replaceAll("_", " ") || "ACCOUNT"}
                        </InfoBadge>
                    </div>
                </div>
            </div>

            <div className="space-y-0">
                <MetadataRow
                    label="Seller ID"
                    value={truncateId(seller.id)}
                    mono
                />

                <MetadataRow label="Full name" value={sellerName} />
                <MetadataRow label="First name" value={seller.firstName} />
                <MetadataRow label="Last name" value={seller.lastName} />
                <MetadataRow label="Email" value={seller.email} />
                <MetadataRow label="Phone" value={seller.phone} />
                <MetadataRow label="Account type" value={seller.accountType} />
                <MetadataRow label="Account status" value={seller.status} />

                <MetadataRow
                    label="Email verification"
                    value={
                        <span
                            className={`inline-flex items-center gap-1 ${
                                seller.emailVerified
                                    ? "text-emerald-600"
                                    : "text-amber-600"
                            }`}
                        >
                            {seller.emailVerified ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                                <Info className="h-3.5 w-3.5" />
                            )}

                            {seller.emailVerified
                                ? "Verified"
                                : "Not verified"}
                        </span>
                    }
                />

                <MetadataRow
                    label="Joined"
                    value={formatReviewDate(seller.createdAt)}
                />
            </div>
        </Section>
    );
}

/* -------------------------------------------------------------------------- */
/* Analysis result                                                            */
/* -------------------------------------------------------------------------- */

function AnalysisResult({
    result,
}: {
    result: NonNullable<AdminImageAnalysis["results"]>[number];
}) {
    const passed = result.passed === true;

    return (
        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    passed
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-600"
                }`}
            >
                {passed ? (
                    <ShieldCheck className="h-4 w-4" />
                ) : (
                    <Info className="h-4 w-4" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold capitalize text-slate-800">
                        {result.resultType.replaceAll("_", " ")}
                    </p>

                    {typeof result.score === "number" && (
                        <span className="text-xs font-bold text-slate-600">
                            {result.score.toFixed(1)}%
                        </span>
                    )}
                </div>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                    {result.reason ||
                        (passed
                            ? "Check passed."
                            : "No additional explanation provided.")}
                </p>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Main detail sections                                                       */
/* -------------------------------------------------------------------------- */

export function ImageReviewDetailSections({
    image,
    listing,
    vehicle,
    seller,
    analysis,
    reviewHistory,
}: Props) {
    return (
        <div className="space-y-5">
            <ListingInformation listing={listing} />

            <VehicleInformation vehicle={vehicle} />

            <SellerInformation seller={seller} />

            <Section
                title="Image information"
                icon={FileImage}
                description="Technical information about the uploaded file."
            >
                <div className="space-y-0">
                    <MetadataRow
                        label="Image ID"
                        value={truncateId(image.imageId)}
                        mono
                    />

                    <MetadataRow
                        label="Listing ID"
                        value={truncateId(image.listingId)}
                        mono
                    />

                    <MetadataRow
                        label="Original filename"
                        value={image.originalName}
                    />

                    <MetadataRow
                        label="File type"
                        value={image.mimeType}
                    />

                    <MetadataRow
                        label="Dimensions"
                        value={
                            image.width && image.height
                                ? `${image.width} × ${image.height}px`
                                : "Unknown"
                        }
                    />

                    <MetadataRow
                        label="Image order"
                        value={`#${image.sortOrder + 1}`}
                    />

                    <MetadataRow
                        label="Uploaded"
                        value={formatReviewDate(image.imageCreatedAt)}
                    />

                    <MetadataRow
                        label="Image status"
                        value={
                            <AdminImageReviewStatus
                                status={image.imageCheckStatus}
                            />
                        }
                    />
                </div>
            </Section>

            <Section
                title="Automated analysis"
                icon={Activity}
                description="Results generated by the image analysis engine."
            >
                <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                    <div>
                        <p className="text-xs font-medium text-slate-500">
                            Analysis state
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-900">
                            {(analysis.analysisState || "UNKNOWN").replaceAll("_", " ")}
                        </p>
                    </div>

                    <span className="rounded-lg bg-[#1491FF]/10 px-3 py-1.5 text-xs font-bold text-[#1491FF]">
                        {analysis.run?.decision || "No decision"}
                    </span>
                </div>

                <div className="space-y-0">
                    <MetadataRow
                        label="Analysis run"
                        value={analysis.run?.status}
                    />

                    <MetadataRow
                        label="Analysis job"
                        value={analysis.job?.status}
                    />

                    <MetadataRow
                        label="Decision reason"
                        value={analysis.run?.decisionReason}
                    />

                    <MetadataRow
                        label="Checked at"
                        value={
                            analysis.image?.checkedAt
                                ? formatReviewDate(analysis.image.checkedAt)
                                : "—"
                        }
                    />
                </div>

                {analysis.failureReason && (
                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                        <p className="text-xs font-bold text-red-700">
                            Analysis failure
                        </p>

                        <p className="mt-1 break-words text-xs leading-5 text-red-600">
                            {analysis.failureReason}
                        </p>
                    </div>
                )}

                {analysis.results?.length ? (
                    <div className="mt-5 space-y-3">
                        <p className="text-xs font-bold text-slate-700">
                            Individual checks
                        </p>

                        {analysis.results.map((result) => (
                            <AnalysisResult
                                key={result.id}
                                result={result}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                        No individual analysis results available.
                    </p>
                )}
            </Section>

            <Section
                title="Similarity & file fingerprints"
                icon={Fingerprint}
                description="Duplicate detection and image identification data."
            >
                <div className="space-y-0">
                    <MetadataRow
                        label="Similarity score"
                        value={
                            image.similarityScore !== null &&
                            image.similarityScore !== undefined
                                ? `${image.similarityScore.toFixed(2)}%`
                                : "No match"
                        }
                    />

                    <MetadataRow
                        label="Matched image"
                        value={
                            image.matchedImageId
                                ? truncateId(image.matchedImageId)
                                : "None"
                        }
                        mono
                    />

                    <MetadataRow
                        label="Matched listing"
                        value={
                            image.matchedListingId
                                ? truncateId(image.matchedListingId)
                                : "None"
                        }
                        mono
                    />

                    <MetadataRow
                        label="SHA-256"
                        value={image.sha256}
                        mono
                    />

                    <MetadataRow
                        label="Perceptual hash"
                        value={image.perceptualHash}
                        mono
                    />
                </div>

                {image.checkReason && (
                    <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3">
                        <p className="text-xs font-bold text-amber-800">
                            Check reason
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-700">
                            {image.checkReason}
                        </p>
                    </div>
                )}
            </Section>

            <Section
                title="Review history"
                icon={History}
                description="Previous moderation decisions for this image."
            >
                {reviewHistory.length ? (
                    <div className="space-y-5">
                        {reviewHistory.map((entry, index) => (
                            <div
                                key={entry.id}
                                className="relative flex gap-3"
                            >
                                {index !== reviewHistory.length - 1 && (
                                    <div className="absolute left-[15px] top-9 h-full w-px bg-slate-200" />
                                )}

                                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1491FF]/10 text-[#1491FF]">
                                    <UserRound className="h-4 w-4" />
                                </div>

                                <div className="min-w-0 flex-1 pb-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-xs font-bold text-slate-800">
                                            {entry.decision.replaceAll("_", " ")}
                                        </p>

                                        <span className="text-[10px] text-slate-400">
                                            {formatReviewDate(entry.createdAt)}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-[11px] text-slate-500">
                                        Reviewer: {truncateId(entry.reviewerId)}
                                    </p>

                                    {entry.reason && (
                                        <p className="mt-2 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                                            {entry.reason}
                                        </p>
                                    )}

                                    {entry.notes && (
                                        <p className="mt-2 text-xs leading-5 text-slate-500">
                                            Notes: {entry.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-6 text-center">
                        <CalendarDays className="mx-auto h-7 w-7 text-slate-300" />

                        <p className="mt-2 text-xs text-slate-500">
                            No previous review decisions.
                        </p>
                    </div>
                )}
            </Section>
        </div>
    );
}