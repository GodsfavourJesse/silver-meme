import type { ReactNode } from "react";
import HomeMobileNav from "../components/userComponents/public/Mobile/HomeMobileNav";

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({
    children,
}: PublicLayoutProps) {
    return (
        <>
            {children}

            <HomeMobileNav />
        </>
    );
}