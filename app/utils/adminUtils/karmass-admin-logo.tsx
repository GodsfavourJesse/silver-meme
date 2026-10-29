interface KarmassAdminLogoProps {
    className?: string;
}

export function KarmassAdminLogo({ className = "" }: KarmassAdminLogoProps) {
    return (
        <div className={`text-center ${className}`}>
            <p className="text-3xl font-bold tracking-[0.35em] text-kar-accent">
                KARMASS
            </p>

            <p className="mt-2 text-[11px] font-medium tracking-[0.45em] text-kar-muted">
                ADMINISTRATION
            </p>
        </div>
    );
}