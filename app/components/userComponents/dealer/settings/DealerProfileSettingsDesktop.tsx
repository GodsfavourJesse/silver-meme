"use client";

import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
    motion,
    useReducedMotion,
    type Variants,
} from "framer-motion";

import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Camera,
    Check,
    CheckCircle2,
    ChevronDown,
    Headset,
    ImagePlus,
    Loader2,
    Pencil,
    Save,
    ShieldCheck,
    Store,
    UserRound,
    X,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
    useUpdateDealerBio,
    useUploadDealerCoverPhoto,
    useUploadDealerProfilePicture,
} from "@/app/hooks/user/dealer/useDealerProfile";

const BRAND_COLOR = "#7008E7";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_BIO_LENGTH = 500;

type DealerProfile = {
    id: string;
    companyName: string;
    verified: boolean;
    bio: string | null;
    profilePictureUrl: string | null;
    coverPhotoUrl: string | null;
};

type DealerProfileSettingsDesktopProps = {
    profile: DealerProfile;
};

const containerVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.04,
        },
    },
};

const sectionVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 10,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function DealerProfileSettingsDesktop({
    profile,
}: DealerProfileSettingsDesktopProps) {
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();

    const coverInputRef = useRef<HTMLInputElement>(null);
    const profileInputRef = useRef<HTMLInputElement>(null);

    const updateBio = useUpdateDealerBio();
    const uploadProfilePicture = useUploadDealerProfilePicture();
    const uploadCoverPhoto = useUploadDealerCoverPhoto();

    const [bio, setBio] = useState(profile.bio ?? "");
    const [savedBio, setSavedBio] = useState(profile.bio ?? "");

    const [coverPreview, setCoverPreview] = useState(
        profile.coverPhotoUrl ?? "",
    );

    const [profilePreview, setProfilePreview] = useState(
        profile.profilePictureUrl ?? "",
    );

    const [showGuidelines, setShowGuidelines] = useState(true);

    useEffect(() => {
        setBio(profile.bio ?? "");
        setSavedBio(profile.bio ?? "");
        setCoverPreview(profile.coverPhotoUrl ?? "");
        setProfilePreview(profile.profilePictureUrl ?? "");
    }, [
        profile.id,
        profile.bio,
        profile.coverPhotoUrl,
        profile.profilePictureUrl,
    ]);

    const isBioDirty = bio.trim() !== savedBio;

    const isUploading =
        uploadProfilePicture.isPending ||
        uploadCoverPhoto.isPending;

    function validateImage(file: File): boolean {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Choose a JPG, PNG, or WEBP image.");
            return false;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            toast.error("Image size must not exceed 5 MB.");
            return false;
        }

        return true;
    }

    async function handleImageChange(
        event: ChangeEvent<HTMLInputElement>,
        type: "profile" | "cover",
    ) {
        const input = event.currentTarget;
        const file = input.files?.[0];

        input.value = "";

        if (!file || !validateImage(file)) return;

        const previewUrl = URL.createObjectURL(file);

        if (type === "profile") {
            const previousImage = profilePreview;

            setProfilePreview(previewUrl);

            try {
                const response =
                    await uploadProfilePicture.mutateAsync(file);

                setProfilePreview(
                    response.data.profile.profilePictureUrl ??
                        previewUrl,
                );
            } catch {
                setProfilePreview(previousImage);
            } finally {
                URL.revokeObjectURL(previewUrl);
            }

            return;
        }

        const previousImage = coverPreview;

        setCoverPreview(previewUrl);

        try {
            const response =
                await uploadCoverPhoto.mutateAsync(file);

            setCoverPreview(
                response.data.profile.coverPhotoUrl ??
                    previewUrl,
            );
        } catch {
            setCoverPreview(previousImage);
        } finally {
            URL.revokeObjectURL(previewUrl);
        }
    }

    async function handleSaveBio() {
        const trimmedBio = bio.trim();

        if (trimmedBio.length > MAX_BIO_LENGTH) {
            toast.error(
                `Your bio cannot exceed ${MAX_BIO_LENGTH} characters.`,
            );
            return;
        }

        if (trimmedBio === savedBio) return;

        try {
            await updateBio.mutateAsync(trimmedBio);

            setBio(trimmedBio);
            setSavedBio(trimmedBio);
        } catch {
            // The existing mutation hook handles error feedback.
        }
    }

    const animationProps = shouldReduceMotion
        ? {}
        : {
              variants: containerVariants,
              initial: "hidden" as const,
              animate: "visible" as const,
          };

    return (
        <main className="min-h-screen overflow-x-clip bg-[#F7F7FA] px-8 py-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1240px]">
                {/* Page header */}
                <motion.header
                    initial={
                        shouldReduceMotion
                            ? false
                            : { opacity: 0, y: -6 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8 flex items-center justify-between gap-6"
                >
                    <div className="flex min-w-0 items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            aria-label="Go back"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:border-purple-200 hover:bg-purple-50 hover:text-[#7008E7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7008E7]"
                        >
                            <ArrowLeft size={19} />
                        </button>

                        <div className="min-w-0">
                            <nav
                                aria-label="Breadcrumb"
                                className="mb-1 flex items-center gap-2 text-xs text-gray-400"
                            >
                                <Link
                                    href="/dashboard"
                                    className="transition-colors hover:text-[#7008E7]"
                                >
                                    Dashboard
                                </Link>

                                <span>/</span>

                                <span className="font-medium text-[#7008E7]">
                                    Storefront settings
                                </span>
                            </nav>

                            <h1 className="text-[26px] font-bold tracking-[-0.045em] text-gray-950">
                                Storefront settings
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage your dealership's public identity and presentation.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/support"
                        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:border-purple-200 hover:text-[#7008E7]"
                    >
                        <Headset size={17} />
                        Get support
                    </Link>
                </motion.header>

                <motion.div
                    {...animationProps}
                    className="space-y-6"
                >
                    {/* Storefront preview */}
                    <motion.section
                        variants={
                            shouldReduceMotion
                                ? undefined
                                : sectionVariants
                        }
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_2px_10px_rgba(20,20,40,0.025)]"
                    >
                        <div className="relative h-[280px] overflow-hidden bg-gray-100">
                            {coverPreview ? (
                                <Image
                                    src={coverPreview}
                                    alt="Dealership storefront cover"
                                    fill
                                    unoptimized
                                    sizes="(min-width: 1280px) 1240px, 100vw"
                                    className="object-cover"
                                />
                            ) : (
                                <div
                                    className="absolute inset-0 flex items-center justify-center"
                                    style={{
                                        background:
                                            "linear-gradient(120deg, #7008E7 0%, #8B45E9 55%, #D8C2F8 100%)",
                                    }}
                                >
                                    <Store
                                        size={58}
                                        strokeWidth={1.2}
                                        className="text-white/60"
                                    />
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/10" />

                            <button
                                type="button"
                                onClick={() =>
                                    coverInputRef.current?.click()
                                }
                                disabled={uploadCoverPhoto.isPending}
                                className="absolute right-5 top-5 inline-flex h-10 items-center gap-2 rounded-xl border border-white/70 bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60"
                            >
                                {uploadCoverPhoto.isPending ? (
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Camera size={16} />
                                )}

                                {uploadCoverPhoto.isPending
                                    ? "Uploading cover..."
                                    : "Change cover"}
                            </button>

                            <div className="absolute bottom-6 left-7 right-7 flex items-end gap-5">
                                <motion.div
                                    whileHover={
                                        shouldReduceMotion
                                            ? undefined
                                            : { y: -2 }
                                    }
                                    transition={{ duration: 0.18 }}
                                    className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg"
                                >
                                    {profilePreview ? (
                                        <Image
                                            src={profilePreview}
                                            alt="Dealership profile picture"
                                            fill
                                            unoptimized
                                            sizes="112px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="flex h-full w-full items-center justify-center text-white"
                                            style={{
                                                backgroundColor:
                                                    BRAND_COLOR,
                                            }}
                                        >
                                            <UserRound size={42} />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            profileInputRef.current?.click()
                                        }
                                        disabled={
                                            uploadProfilePicture.isPending
                                        }
                                        aria-label="Change dealership profile picture"
                                        className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-tl-xl bg-white text-gray-700 shadow-sm transition-colors hover:bg-purple-50 hover:text-[#7008E7] disabled:opacity-60"
                                    >
                                        {uploadProfilePicture.isPending ? (
                                            <Loader2
                                                size={15}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Pencil size={15} />
                                        )}
                                    </button>
                                </motion.div>

                                <div className="min-w-0 flex-1 pb-2 text-white">
                                    <div className="flex items-center gap-2">
                                        <h2 className="truncate text-2xl font-bold tracking-tight">
                                            {profile.companyName}
                                        </h2>

                                        {profile.verified && (
                                            <BadgeCheck
                                                size={22}
                                                className="shrink-0 text-blue-300"
                                            />
                                        )}
                                    </div>

                                    <p className="mt-2 text-sm text-white/85">
                                        {profile.verified
                                            ? "Verified KARMASS dealership"
                                            : "Dealership storefront"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-6 px-7 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#7008E7]">
                                    <Store size={20} />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        Storefront appearance
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Keep your dealership identity current and professional.
                                    </p>
                                </div>
                            </div>

                            {isUploading && (
                                <div
                                    role="status"
                                    className="inline-flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-xs font-semibold text-[#7008E7]"
                                >
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                    Upload in progress
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* Editing workspace */}
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
                        {/* Bio editor */}
                        <motion.section
                            variants={
                                shouldReduceMotion
                                    ? undefined
                                    : sectionVariants
                            }
                            className="rounded-2xl border border-gray-200 bg-white p-7 shadow-[0_2px_10px_rgba(20,20,40,0.025)]"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#7008E7]">
                                    <Store size={22} />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-gray-950">
                                        About your dealership
                                    </h2>

                                    <p className="mt-1.5 max-w-lg text-sm leading-6 text-gray-500">
                                        Introduce your business, the vehicles you specialize in, and what buyers can expect when dealing with you.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7">
                                <div className="mb-2.5 flex items-center justify-between gap-4">
                                    <label
                                        htmlFor="dealer-bio-desktop"
                                        className="text-sm font-semibold text-gray-800"
                                    >
                                        Dealership bio
                                    </label>

                                    <span className="text-xs text-gray-400">
                                        Optional
                                    </span>
                                </div>

                                <textarea
                                    id="dealer-bio-desktop"
                                    value={bio}
                                    onChange={(event) =>
                                        setBio(
                                            event.target.value.slice(
                                                0,
                                                MAX_BIO_LENGTH,
                                            ),
                                        )
                                    }
                                    maxLength={MAX_BIO_LENGTH}
                                    rows={7}
                                    placeholder="Tell buyers about your dealership, your experience, the vehicles you offer, and why they can trust your business."
                                    className="min-h-[180px] w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm leading-7 text-gray-900 outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-[#7008E7] focus:ring-4 focus:ring-purple-100"
                                />

                                <div className="mt-2.5 flex items-center justify-between gap-4">
                                    <p className="text-xs text-gray-400">
                                        Clear, accurate descriptions build buyer confidence.
                                    </p>

                                    <span
                                        className={`shrink-0 text-xs font-medium ${
                                            bio.length >= MAX_BIO_LENGTH
                                                ? "text-amber-600"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {bio.length}/{MAX_BIO_LENGTH}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
                                <div className="flex min-w-0 items-center gap-2">
                                    {isBioDirty ? (
                                        <>
                                            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />

                                            <p className="text-xs text-gray-500">
                                                Unsaved changes
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2
                                                size={16}
                                                className="shrink-0 text-emerald-600"
                                            />

                                            <p className="text-xs text-gray-500">
                                                All changes saved
                                            </p>
                                        </>
                                    )}
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                    {isBioDirty && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setBio(savedBio)
                                            }
                                            disabled={
                                                updateBio.isPending
                                            }
                                            className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <X size={15} />
                                            Cancel
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            void handleSaveBio()
                                        }
                                        disabled={
                                            !isBioDirty ||
                                            updateBio.isPending
                                        }
                                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#7008E7] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#5F06C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7008E7] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {updateBio.isPending ? (
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Save size={16} />
                                        )}

                                        {updateBio.isPending
                                            ? "Saving..."
                                            : "Save changes"}
                                    </button>
                                </div>
                            </div>
                        </motion.section>

                        {/* Sidebar */}
                        <motion.aside
                            variants={
                                shouldReduceMotion
                                    ? undefined
                                    : sectionVariants
                            }
                            className="space-y-5"
                        >
                            {/* Guidelines */}
                            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                <button
                                    type="button"
                                    aria-expanded={showGuidelines}
                                    onClick={() =>
                                        setShowGuidelines(
                                            (current) => !current,
                                        )
                                    }
                                    className="flex min-h-[76px] w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#7008E7]">
                                        <ImagePlus size={19} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-bold text-gray-900">
                                            Image guidelines
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Get the best results from your images.
                                        </p>
                                    </div>

                                    <motion.div
                                        animate={
                                            shouldReduceMotion
                                                ? undefined
                                                : {
                                                      rotate: showGuidelines
                                                          ? 180
                                                          : 0,
                                                  }
                                        }
                                        transition={{
                                            duration: 0.2,
                                        }}
                                    >
                                        <ChevronDown
                                            size={18}
                                            className="text-gray-400"
                                        />
                                    </motion.div>
                                </button>

                                {showGuidelines && (
                                    <div className="space-y-4 border-t border-gray-100 px-5 py-5">
                                        {[
                                            "Use JPG, PNG, or WEBP images.",
                                            "Keep each image below 5 MB.",
                                            "Use a clear logo or professional profile image.",
                                            "Choose a wide, high-quality cover photo.",
                                        ].map((guideline) => (
                                            <div
                                                key={guideline}
                                                className="flex items-start gap-2.5"
                                            >
                                                <Check
                                                    size={16}
                                                    className="mt-0.5 shrink-0 text-[#7008E7]"
                                                />

                                                <p className="text-xs leading-5 text-gray-600">
                                                    {guideline}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Trust card */}
                            <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700">
                                        <ShieldCheck size={20} />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">
                                            Build buyer confidence
                                        </h3>

                                        <p className="mt-2 text-xs leading-5 text-gray-600">
                                            Keep your dealership details accurate and use clear images to help buyers recognize your business.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Support card */}
                            <Link
                                href="/support"
                                className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-purple-200"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors group-hover:bg-purple-50 group-hover:text-[#7008E7]">
                                    <Headset size={19} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Need assistance?
                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                        Contact our support team.
                                    </p>
                                </div>

                                <ArrowRight
                                    size={17}
                                    className="shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#7008E7]"
                                />
                            </Link>
                        </motion.aside>
                    </div>

                    {/* Footer */}
                    <motion.footer
                        variants={
                            shouldReduceMotion
                                ? undefined
                                : sectionVariants
                        }
                        className="flex items-center justify-between gap-4 border-t border-gray-200 py-5"
                    >
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                            <BadgeCheck size={15} />
                            KARMASS Dealer Hub
                        </div>

                        <p className="text-right text-xs text-gray-400">
                            Your dealership, your identity.
                        </p>
                    </motion.footer>
                </motion.div>
            </div>

            {/* Hidden file inputs */}
            <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) =>
                    void handleImageChange(event, "cover")
                }
            />

            <input
                ref={profileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) =>
                    void handleImageChange(event, "profile")
                }
            />
        </main>
    );
}