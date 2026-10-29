import { Suspense } from "react";
import type { Metadata } from "next";
import { MessagesInbox } from "@/app/components/userComponents/messaging/MessagingInbox";

export const metadata: Metadata = {
    title: "Messages | KARMASS",
    description:
        "Manage your conversations with buyers and sellers on KARMASS.",
};

function MessagesLoading() {
    return (
        <main className="min-h-screen overflow-hidden bg-[#FAF9FD] px-3 py-5 text-slate-900 sm:px-6 sm:py-8">
            <div className="mx-auto max-w-7xl animate-pulse">
                <div className="mb-7 space-y-3">
                    <div className="h-3 w-32 rounded-full bg-purple-100" />
                    <div className="h-9 w-48 rounded-xl bg-slate-200/80" />
                    <div className="h-4 w-72 max-w-full rounded-full bg-slate-100" />
                </div>

                <div className="overflow-hidden rounded-[24px] border border-white bg-white/80 shadow-[0_20px_70px_rgba(42,24,75,0.07)] backdrop-blur-xl">
                    <div className="grid min-h-[620px] lg:grid-cols-[340px_minmax(0,1fr)]">
                        <div className="border-b border-slate-100 p-5 lg:border-b-0 lg:border-r">
                            <div className="mb-6 h-5 w-40 rounded-lg bg-slate-200" />

                            {Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="mb-5 flex gap-3"
                                >
                                    <div className="h-11 w-11 shrink-0 rounded-2xl bg-slate-100" />

                                    <div className="flex-1 space-y-2 pt-1">
                                        <div className="h-3 w-28 rounded-full bg-slate-200" />
                                        <div className="h-3 w-full rounded-full bg-slate-100" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="hidden flex-col lg:flex">
                            <div className="flex items-center gap-3 border-b border-slate-100 p-5">
                                <div className="h-11 w-11 rounded-2xl bg-slate-100" />
                                <div className="space-y-2">
                                    <div className="h-3 w-32 rounded-full bg-slate-200" />
                                    <div className="h-3 w-24 rounded-full bg-slate-100" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-5 p-6">
                                <div className="h-16 w-2/3 rounded-2xl bg-slate-100" />
                                <div className="ml-auto h-16 w-1/2 rounded-2xl bg-purple-100/80" />
                                <div className="h-20 w-3/5 rounded-2xl bg-slate-100" />
                            </div>

                            <div className="m-4 h-16 rounded-2xl bg-slate-100/80" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<MessagesLoading />}>
            <MessagesInbox />
        </Suspense>
    );
}