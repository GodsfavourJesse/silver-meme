"use client";

export function ImageReviewDetailSkeleton() {
    return (
        <div aria-busy="true" className="space-y-6 animate-pulse">
            <div className="h-5 w-32 rounded bg-slate-200" />

            <div className="grid gap-6 xl:grid-cols-12">
                <div className="space-y-6 xl:col-span-7">
                    <div className="h-[420px] rounded-2xl bg-slate-200" />

                    <div className="h-48 rounded-2xl bg-slate-200" />
                </div>

                <div className="space-y-6 xl:col-span-5">
                    <div className="h-64 rounded-2xl bg-slate-200" />
                    <div className="h-56 rounded-2xl bg-slate-200" />
                    <div className="h-48 rounded-2xl bg-slate-200" />
                </div>
            </div>
        </div>
    );
}