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

type DealerProfileSettingsMobileProps = {
    profile: DealerProfile;
};

export default function DealerProfileSettingsMobile({
    profile,
}: DealerProfileSettingsMobileProps) {
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

    const [showGuidelines, setShowGuidelines] = useState(false);

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

                const updatedProfile = response.data.profile;

                setProfilePreview(
                    updatedProfile.profilePictureUrl ?? previewUrl,
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

            const updatedProfile = response.data.profile;

            setCoverPreview(
                updatedProfile.coverPhotoUrl ?? previewUrl,
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

    const enterAnimation = shouldReduceMotion
        ? {}
        : {
              initial: { opacity: 0, y: 8 },
              animate: { opacity: 1, y: 0 },
              transition: {
                  duration: 0.28,
                  ease: "easeOut" as const,
              },
          };

    return (
        <main className="min-h-screen overflow-x-clip bg-[#F7F7FA] pb-8">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
                <div className="flex min-h-[62px] items-center gap-3 px-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        aria-label="Go back"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7008E7]"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="min-w-0 flex-1">
                        <h1 className="text-[15px] font-bold tracking-tight text-gray-950">
                            Storefront settings
                        </h1>

                        <p className="mt-0.5 text-[11px] text-gray-500">
                            Manage your dealership profile
                        </p>
                    </div>

                    <Link
                        href="/support"
                        aria-label="Contact support"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#7008E7]"
                    >
                        <Headset size={18} />
                    </Link>
                </div>
            </header>

            <motion.div
                {...enterAnimation}
                className="mx-auto w-full max-w-xl space-y-4 px-4 pb-6 pt-5"
            >
                {/* Page introduction */}
                <section>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#7008E7]">
                        Dealer account
                    </p>

                    <h2 className="mt-1.5 text-[23px] font-bold leading-tight tracking-[-0.045em] text-gray-950">
                        Your storefront
                    </h2>

                    <p className="mt-2 max-w-sm text-[13px] leading-5 text-gray-500">
                        Manage how your dealership appears to potential buyers.
                    </p>
                </section>

                {/* Storefront identity card */}
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_2px_8px_rgba(20,20,40,0.025)]">
                    {/* Cover image */}
                    <div className="relative h-[150px] bg-gray-100">
                        {coverPreview ? (
                            <Image
                                src={coverPreview}
                                alt="Dealership cover"
                                fill
                                unoptimized
                                sizes="100vw"
                                className="object-cover"
                            />
                        ) : (
                            <div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{
                                    background:
                                        "linear-gradient(120deg, #7008E7, #8B45E9 55%, #C4A2F5)",
                                }}
                            >
                                <Store
                                    size={35}
                                    className="text-white/70"
                                    strokeWidth={1.5}
                                />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />

                        <button
                            type="button"
                            onClick={() =>
                                coverInputRef.current?.click()
                            }
                            disabled={uploadCoverPhoto.isPending}
                            className="absolute right-3 top-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/70 bg-white px-3 text-[11px] font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60"
                        >
                            {uploadCoverPhoto.isPending ? (
                                <Loader2
                                    size={14}
                                    className="animate-spin"
                                />
                            ) : (
                                <Camera size={14} />
                            )}

                            {uploadCoverPhoto.isPending
                                ? "Uploading"
                                : "Edit cover"}
                        </button>
                    </div>

                    {/* Identity */}
                    <div className="px-4 pb-4">
                        <div className="-mt-8 flex items-end gap-3">
                            <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-sm">
                                {profilePreview ? (
                                    <Image
                                        src={profilePreview}
                                        alt="Dealership profile"
                                        fill
                                        unoptimized
                                        sizes="76px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div
                                        className="flex h-full w-full items-center justify-center text-white"
                                        style={{
                                            backgroundColor: BRAND_COLOR,
                                        }}
                                    >
                                        <UserRound size={30} />
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
                                    aria-label="Edit dealership profile picture"
                                    className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-tl-lg bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-100 disabled:opacity-60"
                                >
                                    {uploadProfilePicture.isPending ? (
                                        <Loader2
                                            size={13}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Pencil size={13} />
                                    )}
                                </button>
                            </div>

                            {profile.verified && (
                                <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                                    <BadgeCheck size={13} />
                                    Verified
                                </span>
                            )}
                        </div>

                        <div className="mt-3 min-w-0">
                            <h3 className="break-words text-[17px] font-bold leading-6 tracking-tight text-gray-950">
                                {profile.companyName}
                            </h3>

                            <p className="mt-1 text-[12px] leading-5 text-gray-500">
                                {profile.verified
                                    ? "Your dealership is verified on KARMASS."
                                    : "Your public dealership identity."}
                            </p>
                        </div>

                        {isUploading && (
                            <div
                                role="status"
                                className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 text-[11px] font-medium text-[#7008E7]"
                            >
                                <Loader2
                                    size={14}
                                    className="animate-spin"
                                />
                                Uploading your image…
                            </div>
                        )}
                    </div>
                </section>

                {/* Bio editor */}
                <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_2px_8px_rgba(20,20,40,0.025)]">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#7008E7]">
                            <Store size={19} />
                        </div>

                        <div className="min-w-0 flex-1 pt-0.5">
                            <h3 className="text-[14px] font-bold text-gray-950">
                                About your dealership
                            </h3>

                            <p className="mt-1 text-[12px] leading-5 text-gray-500">
                                Introduce your business and help buyers understand what you offer.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <label
                                htmlFor="dealer-bio-mobile"
                                className="text-[12px] font-semibold text-gray-800"
                            >
                                Dealership bio
                            </label>

                            <span className="text-[11px] text-gray-400">
                                Optional
                            </span>
                        </div>

                        <textarea
                            id="dealer-bio-mobile"
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
                            rows={5}
                            placeholder="Describe your dealership, the vehicles you specialize in, and what buyers can expect from you."
                            className="min-h-[140px] w-full resize-y rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-[13px] leading-6 text-gray-900 outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-[#7008E7] focus:ring-4 focus:ring-purple-100"
                        />

                        <div className="mt-2 flex items-center justify-between gap-3">
                            <p className="text-[11px] leading-5 text-gray-400">
                                Keep it clear and professional.
                            </p>

                            <span
                                className={`shrink-0 text-[11px] font-medium ${
                                    bio.length >= MAX_BIO_LENGTH
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                            >
                                {bio.length}/{MAX_BIO_LENGTH}
                            </span>
                        </div>
                    </div>

                    {isBioDirty && (
                        <motion.div
                            initial={
                                shouldReduceMotion
                                    ? false
                                    : { opacity: 0, y: 4 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.18 }}
                            className="mt-4 border-t border-gray-100 pt-4"
                        >
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                                <p className="text-[11px] text-gray-500">
                                    You have unsaved changes.
                                </p>
                            </div>

                            <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
                                <button
                                    type="button"
                                    onClick={() => setBio(savedBio)}
                                    disabled={updateBio.isPending}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-[12px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <X size={15} />
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={() => void handleSaveBio()}
                                    disabled={updateBio.isPending}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7008E7] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#5F06C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7008E7] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {updateBio.isPending ? (
                                        <Loader2
                                            size={15}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Save size={15} />
                                    )}

                                    {updateBio.isPending
                                        ? "Saving changes…"
                                        : "Save changes"}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {!isBioDirty && (
                        <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
                            <CheckCircle2
                                size={15}
                                className="text-emerald-600"
                            />

                            <p className="text-[11px] text-gray-500">
                                Your dealership bio is up to date.
                            </p>
                        </div>
                    )}
                </section>

                {/* Image guidelines */}
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <button
                        type="button"
                        aria-expanded={showGuidelines}
                        onClick={() =>
                            setShowGuidelines((current) => !current)
                        }
                        className="flex min-h-[66px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                            <ImagePlus size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="text-[13px] font-bold text-gray-900">
                                Image guidelines
                            </h3>

                            <p className="mt-1 text-[11px] leading-4 text-gray-500">
                                Recommended formats and image sizes
                            </p>
                        </div>

                        <motion.div
                            animate={
                                shouldReduceMotion
                                    ? undefined
                                    : {
                                          rotate: showGuidelines ? 180 : 0,
                                      }
                            }
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown
                                size={18}
                                className="text-gray-400"
                            />
                        </motion.div>
                    </button>

                    {showGuidelines && (
                        <motion.div
                            initial={
                                shouldReduceMotion
                                    ? false
                                    : { opacity: 0, height: 0 }
                            }
                            animate={{ opacity: 1, height: "auto" }}
                            exit={
                                shouldReduceMotion
                                    ? undefined
                                    : { opacity: 0, height: 0 }
                            }
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-3 border-t border-gray-100 px-4 py-4">
                                {[
                                    "Use JPG, PNG, or WEBP images.",
                                    "Maximum file size is 5 MB per image.",
                                    "Use a clear dealership logo or profile image.",
                                    "Choose a wide cover photo that represents your business.",
                                ].map((guideline) => (
                                    <div
                                        key={guideline}
                                        className="flex items-start gap-2.5"
                                    >
                                        <Check
                                            size={15}
                                            className="mt-0.5 shrink-0 text-[#7008E7]"
                                        />

                                        <p className="text-[12px] leading-5 text-gray-600">
                                            {guideline}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </section>

                {/* Support */}
                <Link
                    href="/support"
                    className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-purple-200"
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#7008E7]">
                        <Headset size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-gray-900">
                            Need help with your storefront?
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-gray-500">
                            Contact the KARMASS support team.
                        </p>
                    </div>

                    <ArrowRight
                        size={17}
                        className="shrink-0 text-gray-400"
                    />
                </Link>

                {/* Footer */}
                <footer className="flex items-center justify-center gap-2 pt-1 text-[10px] font-medium text-gray-400">
                    <BadgeCheck size={14} />
                    KARMASS Dealer Hub
                </footer>
            </motion.div>

            {/* Hidden image inputs */}
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