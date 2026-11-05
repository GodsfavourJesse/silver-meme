interface KarmassPageLoaderProps {
    message?: string;
}

/**
 * Branded loading UI used by Next.js App Router loading boundaries.
 * Keep this component server-renderable so it can appear immediately.
 */
export function KarmassPageLoader({
    message = "Getting things ready for you",
}: KarmassPageLoaderProps) {
    return (
        <main
            role="status"
            aria-live="polite"
            aria-label="KARMASS is loading"
            className="flex min-h-[100svh] w-full items-center justify-center bg-[#F7FAFE] px-6"
        >
            <div className="flex w-full max-w-[280px] flex-col items-center">
                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1491FF] text-white text-[20px] font-semibold shadow-[0_8px_24px_rgba(20,145,255,0.22)]">
                    K.
                </div>

                <p className="text-[25px] font-extrabold tracking-[0.19em] text-[#10243A]">
                    KARMASS
                </p>
                <p className="mt-2 text-center text-[13px] font-medium text-[#718198]">
                    {message}
                </p>

                <div
                    aria-hidden="true"
                    className="karmass-loader-track mt-8 h-[3px] w-full overflow-hidden rounded-full bg-[#DCEBFA]"
                >
                    <span className="karmass-loader-bar block h-full w-[38%] rounded-full bg-[#1491FF]" />
                </div>

                <span className="mt-3 text-[10px] font-semibold tracking-[0.2em] text-[#9AAABD]">
                    YOUR NEXT DRIVE STARTS HERE
                </span>
            </div>
        </main>
    );
}
