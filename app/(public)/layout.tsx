import { Suspense, type ReactNode } from "react";
import HomeMobileNav from "../components/userComponents/public/Mobile/HomeMobileNav";

interface PublicLayoutProps {
    children: ReactNode;
}

function MobileNavFallback() {
    return ( 
        <div
            aria-hidden="true"
            className="fixed inset-x-3 bottom-3 z-40 h-[68px] rounded-[22px] border border-[#E6EDF5] bg-white/95 p-2 shadow-[0_8px_32px_rgba(15,23,42,0.10)] md:hidden"
        > 
            <div className="grid h-full grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, index) => ( 
                    <div
                        key={index}
                        className="animate-pulse rounded-[15px] bg-slate-100"
                    />
                ))} 
            </div> 
        
        </div>
    );
}

export default function PublicLayout({
children,
}: PublicLayoutProps) {
    return (
        <>
            {children}
            <Suspense fallback={<MobileNavFallback />}>
                <HomeMobileNav />
            </Suspense>
        </>
    );
}