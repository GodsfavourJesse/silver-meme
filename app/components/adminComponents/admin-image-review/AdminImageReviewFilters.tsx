"use client";

import { AdminImageReviewFilter, AdminImageReviewSort } from "@/app/types/admin/adminImageReview.types";
import {
    ArrowDownWideNarrow,
    Filter,
} from "lucide-react";

interface AdminImageReviewFiltersProps {
    status: AdminImageReviewFilter;
    sort: AdminImageReviewSort;
    onStatusChange: (
        status: AdminImageReviewFilter,
    ) => void;
    onSortChange: (
        sort: AdminImageReviewSort,
    ) => void;
    total: number;
}

const FILTERS: {
    label: string;
    value: AdminImageReviewFilter;
}[] = [
    { label: "All images", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Needs review", value: "REVIEW" },
    { label: "Failed", value: "FAILED" },
    { label: "Passed", value: "PASSED" },
];

export function AdminImageReviewFilters({
    status,
    sort,
    onStatusChange,
    onSortChange,
    total,
}: AdminImageReviewFiltersProps) {
    return (
        <div className="
            space-y-4 rounded-2xl border
            border-slate-200 bg-white p-3.5 sm:p-4
        ">
            <div className="
                flex flex-col gap-3
                sm:flex-row sm:items-center
                sm:justify-between
            ">
                <div className="flex items-center gap-2">
                    <Filter
                        size={16}
                        className="text-slate-400"
                    />

                    <span className="
                        text-sm font-semibold text-slate-800
                    ">
                        Review queue
                    </span>

                    <span className="
                        rounded-full bg-slate-100
                        px-2 py-0.5 text-[10px]
                        font-semibold text-slate-500
                    ">
                        {total}
                    </span>
                </div>

                <div className="
                    flex items-center gap-2
                    self-start sm:self-auto
                ">
                    <ArrowDownWideNarrow
                        size={15}
                        className="text-slate-400"
                    />

                    <select
                        value={sort}
                        onChange={(event) =>
                            onSortChange(
                                event.target.value as AdminImageReviewSort,
                            )
                        }
                        className="
                            h-9 rounded-lg border
                            border-slate-200 bg-white
                            px-2.5 text-xs font-medium
                            text-slate-700 outline-none
                            transition-colors
                            focus:border-[#1491FF]
                            focus:ring-2
                            focus:ring-[#1491FF]/10
                        "
                    >
                        <option value="oldest">
                            Oldest first
                        </option>

                        <option value="newest">
                            Newest first
                        </option>
                    </select>
                </div>
            </div>

            <div className="
                -mx-1 flex gap-1.5 overflow-x-auto
                px-1 pb-1
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
            ">
                {FILTERS.map((filter) => {
                    const active =
                        status === filter.value;

                    return (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() =>
                                onStatusChange(filter.value)
                            }
                            className={`
                                shrink-0 rounded-lg
                                px-3 py-2 text-xs
                                font-semibold transition-all
                                ${active
                                    ? "bg-[#1491FF] text-white shadow-sm shadow-[#1491FF]/20"
                                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                }
                            `}
                        >
                            {filter.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}