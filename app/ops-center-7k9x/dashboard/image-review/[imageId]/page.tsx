import { Suspense } from "react";

import ImageReviewPageClient from "./ImageReviewPageClient";

interface PageProps {
    params: Promise<{
        imageId: string;
    }>;
}

interface ImageReviewRouteContentProps {
    params: PageProps["params"];
}

function ImageReviewLoader() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center px-5">
            <div className="flex flex-col items-center text-center">
                <div className="relative flex h-12 w-12 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-[#1491FF]/15" />

                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#1491FF]" />
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-800">
                    Loading image review
                </p>

                <p className="mt-1 text-xs text-slate-500">
                    Please wait while we retrieve the image details.
                </p>
            </div>
        </div>
    );
}

/**
 * This component resolves the dynamic route parameter.
 * It must remain inside the Suspense boundary.
 */
async function ImageReviewRouteContent({
    params,
}: ImageReviewRouteContentProps) {
    const { imageId } = await params;

    return <ImageReviewPageClient imageId={imageId} />;
}

export default function AdminImageReviewDetailRoute({
    params,
}: PageProps) {
    return (
        <Suspense fallback={<ImageReviewLoader />}>
            <ImageReviewRouteContent params={params} />
        </Suspense>
    );
}