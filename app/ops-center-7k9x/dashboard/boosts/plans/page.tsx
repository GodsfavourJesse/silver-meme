"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import type {
    ElementType,
    FormEvent,
} from "react";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

import {
    Activity,
    ArrowUpRight,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock3,
    Coins,
    Edit3,
    Layers3,
    LoaderCircle,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    Sparkles,
    ToggleLeft,
    ToggleRight,
    Trash2,
    X,
    Zap,
} from "lucide-react";

import { toast } from "sonner";

import type {
    AdminBoostPlan,
    CreateAdminBoostPlanInput,
} from "@/app/types/admin/admin-boosts/adminBoostPlan.types";

import {
    useAdminBoostPlans,
    useCreateAdminBoostPlan,
    useDeactivateAdminBoostPlan,
    useUpdateAdminBoostPlan,
} from "@/app/hooks/admin/admin-boost/useAdminBoostPlans";

/* =====================================================
   TYPES
===================================================== */

type PlanFilter = "ALL" | "ACTIVE" | "INACTIVE";

type PlanFormValues = {
    durationDays: string;
    price: string;
    currency: string;
    active: boolean;
};

const EMPTY_FORM: PlanFormValues = {
    durationDays: "",
    price: "",
    currency: "NGN",
    active: true,
};

/* =====================================================
   HELPERS
===================================================== */

function formatCurrency(
    amount: string | number,
    currency = "NGN",
): string {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return `${currency} 0.00`;
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${currency} ${value.toLocaleString("en-NG")}`;
    }
}

function formatDate(date: string): string {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(parsedDate);
}

function getPlanName(days: number): string {
    return `${days}-Day Boost`;
}

function getPricePerDay(plan: AdminBoostPlan): number {
    const price = Number(plan.price);

    if (!Number.isFinite(price) || plan.durationDays <= 0) {
        return 0;
    }

    return price / plan.durationDays;
}

function getErrorMessage(
    error: unknown,
    fallback: string,
): string {
    return error instanceof Error
        ? error.message
        : fallback;
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    iconClass,
}: {
    title: string;
    value: string | number;
    description: string;
    icon: ElementType;
    iconClass: string;
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                        {value}
                    </h3>

                    <p className="mt-2 text-xs text-slate-500">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon size={21} />
                </div>
            </div>
        </div>
    );
}

/* =====================================================
   PLAN STATUS
===================================================== */

function PlanStatus({
    active,
}: {
    active: number;
}) {
    const isActive = active === 1;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isActive
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
            }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    isActive
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                }`}
            />

            {isActive ? "Active" : "Inactive"}
        </span>
    );
}

/* =====================================================
   CREATE / EDIT PLAN MODAL
===================================================== */

function PlanModal({
    open,
    plan,
    onClose,
}: {
    open: boolean;
    plan: AdminBoostPlan | null;
    onClose: () => void;
}) {
    const createMutation = useCreateAdminBoostPlan();
    const updateMutation = useUpdateAdminBoostPlan();

    const [form, setForm] = useState<PlanFormValues>(
        EMPTY_FORM,
    );

    const isEditing = Boolean(plan);

    const isPending =
        createMutation.isPending ||
        updateMutation.isPending;

    useEffect(() => {
        if (!open) {
            return;
        }

        if (plan) {
            setForm({
                durationDays: String(plan.durationDays),
                price: String(plan.price),
                currency: plan.currency,
                active: plan.active === 1,
            });
        } else {
            setForm({ ...EMPTY_FORM });
        }
    }, [open, plan]);

    function updateField<K extends keyof PlanFormValues>(
        field: K,
        value: PlanFormValues[K],
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const durationDays = Number(form.durationDays);
        const price = Number(form.price);
        const currency = form.currency.trim().toUpperCase();

        if (
            !Number.isInteger(durationDays) ||
            durationDays <= 0
        ) {
            toast.error("Enter a valid boost duration.");
            return;
        }

        if (
            !Number.isFinite(price) ||
            price < 0 ||
            price > 999999999999.99
        ) {
            toast.error("Enter a valid boost price.");
            return;
        }

        if (
            currency.length < 3 ||
            currency.length > 10
        ) {
            toast.error("Enter a valid currency.");
            return;
        }

        const payload: CreateAdminBoostPlanInput = {
            durationDays,
            price,
            currency,
            active: form.active ? 1 : 0,
        };

        try {
            if (plan) {
                await updateMutation.mutateAsync({
                    planId: plan.id,
                    input: payload,
                });

                toast.success(
                    "Boost plan updated successfully.",
                );
            } else {
                await createMutation.mutateAsync(payload);

                toast.success(
                    "Boost plan created successfully.",
                );
            }

            setForm({ ...EMPTY_FORM });
            onClose();
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "Unable to save boost plan.",
                ),
            );
        }
    }

    function closeModal() {
        if (isPending) {
            return;
        }

        setForm({ ...EMPTY_FORM });
        onClose();
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 20,
                            scale: 0.97,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 15,
                            scale: 0.97,
                        }}
                        transition={{ duration: 0.2 }}
                        className="my-auto w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
                    >
                        {/* MODAL HEADER */}

                        <div className="relative overflow-hidden bg-[#1491FF] px-6 py-6 text-white">
                            <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" />

                            <div className="relative flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                                        <Zap size={23} />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-bold">
                                            {isEditing
                                                ? "Edit Boost Plan"
                                                : "Create Boost Plan"}
                                        </h2>

                                        <p className="mt-1 text-sm text-blue-50">
                                            Configure your listing promotion package.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={isPending}
                                    aria-label="Close modal"
                                    className="rounded-lg p-2 text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-50"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* MODAL FORM */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >
                            {/* DURATION */}

                            <div>
                                <label
                                    htmlFor="boost-duration"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Plan Duration
                                </label>

                                <div className="relative">
                                    <CalendarDays
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="boost-duration"
                                        type="number"
                                        min="1"
                                        step="1"
                                        required
                                        placeholder="e.g. 7"
                                        value={form.durationDays}
                                        onChange={(event) =>
                                            updateField(
                                                "durationDays",
                                                event.target.value,
                                            )
                                        }
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-16 text-sm font-medium text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-[#1491FF] focus:bg-white focus:ring-4 focus:ring-blue-50"
                                    />

                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                        Days
                                    </span>
                                </div>

                                <p className="mt-1.5 text-xs text-slate-400">
                                    Duration starts after admin approval of a paid boost request.
                                </p>
                            </div>

                            {/* PRICE */}

                            <div>
                                <label
                                    htmlFor="boost-price"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Plan Price
                                </label>

                                <div className="flex gap-2">
                                    <div className="w-28 shrink-0">
                                        <select
                                            aria-label="Currency"
                                            value={form.currency}
                                            onChange={(event) =>
                                                updateField(
                                                    "currency",
                                                    event.target.value,
                                                )
                                            }
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#1491FF] focus:ring-4 focus:ring-blue-50"
                                        >
                                            <option value="NGN">
                                                NGN
                                            </option>
                                            <option value="USD">
                                                USD
                                            </option>
                                            <option value="GBP">
                                                GBP
                                            </option>
                                            <option value="EUR">
                                                EUR
                                            </option>
                                        </select>
                                    </div>

                                    <div className="relative flex-1">
                                        <Coins
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            id="boost-price"
                                            type="number"
                                            min="0"
                                            max="999999999999.99"
                                            step="0.01"
                                            required
                                            placeholder="Enter amount"
                                            value={form.price}
                                            onChange={(event) =>
                                                updateField(
                                                    "price",
                                                    event.target.value,
                                                )
                                            }
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-[#1491FF] focus:bg-white focus:ring-4 focus:ring-blue-50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* PREVIEW */}

                            <div className="rounded-2xl border border-blue-100 bg-[#F4F9FF] p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1491FF]">
                                        <Sparkles size={18} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-slate-800">
                                            Plan Preview
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {form.durationDays &&
                                            Number(form.durationDays) > 0
                                                ? getPlanName(
                                                      Number(form.durationDays),
                                                  )
                                                : "Your plan name will appear here."}
                                        </p>

                                        <p className="mt-2 text-xl font-bold text-[#0877D9]">
                                            {formatCurrency(
                                                form.price || 0,
                                                form.currency,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* AVAILABILITY */}

                            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Make plan available
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Allow sellers to purchase this plan.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-label="Make plan available"
                                    aria-checked={form.active}
                                    onClick={() =>
                                        updateField(
                                            "active",
                                            !form.active,
                                        )
                                    }
                                    className={`relative flex h-7 w-12 shrink-0 items-center rounded-full transition ${
                                        form.active
                                            ? "bg-[#1491FF]"
                                            : "bg-slate-300"
                                    }`}
                                >
                                    <span
                                        className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                            form.active
                                                ? "translate-x-6"
                                                : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* ACTIONS */}

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={isPending}
                                    className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#0877D9] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isPending ? (
                                        <>
                                            <LoaderCircle
                                                size={17}
                                                className="animate-spin"
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={17} />
                                            {isEditing
                                                ? "Save Changes"
                                                : "Create Plan"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* =====================================================
   DEACTIVATE CONFIRMATION
===================================================== */

function DeactivateDialog({
    plan,
    onClose,
}: {
    plan: AdminBoostPlan | null;
    onClose: () => void;
}) {
    const deactivateMutation = useDeactivateAdminBoostPlan();

    async function handleDeactivate() {
        if (!plan) {
            return;
        }

        try {
            await deactivateMutation.mutateAsync(plan.id);

            toast.success(
                "Boost plan deactivated successfully.",
            );

            onClose();
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "Unable to deactivate boost plan.",
                ),
            );
        }
    }

    return (
        <AnimatePresence>
            {plan && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !deactivateMutation.isPending
                        ) {
                            onClose();
                        }
                    }}
                >
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.95,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.95,
                        }}
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                            <ShieldCheck size={25} />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-900">
                            Deactivate this plan?
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            You're about to deactivate{" "}
                            <strong className="text-slate-800">
                                {getPlanName(plan.durationDays)}
                            </strong>
                            . Sellers will no longer be able to purchase
                            it. Existing boost records will remain intact.
                        </p>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={deactivateMutation.isPending}
                                onClick={onClose}
                                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Keep Plan
                            </button>

                            <button
                                type="button"
                                onClick={handleDeactivate}
                                disabled={deactivateMutation.isPending}
                                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
                            >
                                {deactivateMutation.isPending ? (
                                    <LoaderCircle
                                        size={17}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Trash2 size={17} />
                                )}

                                Deactivate Plan
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* =====================================================
   MAIN PAGE
===================================================== */

export default function AdminBoostPlansPage() {
    const {
        data: plans = [],
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useAdminBoostPlans();

    const updateMutation = useUpdateAdminBoostPlan();

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<PlanFilter>("ALL");

    const [modalOpen, setModalOpen] = useState(false);

    const [selectedPlan, setSelectedPlan] =
        useState<AdminBoostPlan | null>(null);

    const [planToDeactivate, setPlanToDeactivate] =
        useState<AdminBoostPlan | null>(null);

    /* =================================================
       STATISTICS
    ================================================= */

    const stats = useMemo(() => {
        const active = plans.filter(
            (plan) => plan.active === 1,
        ).length;

        const inactive = plans.filter(
            (plan) => plan.active === 0,
        ).length;

        const totalBoosts = plans.reduce(
            (total, plan) =>
                total + Number(plan.totalBoosts || 0),
            0,
        );

        return {
            total: plans.length,
            active,
            inactive,
            totalBoosts,
        };
    }, [plans]);

    /* =================================================
       SEARCH AND FILTER
    ================================================= */

    const filteredPlans = useMemo(() => {
        const query = search.trim().toLowerCase();

        return plans
            .filter((plan) => {
                if (
                    filter === "ACTIVE" &&
                    plan.active !== 1
                ) {
                    return false;
                }

                if (
                    filter === "INACTIVE" &&
                    plan.active !== 0
                ) {
                    return false;
                }

                if (!query) {
                    return true;
                }

                return (
                    getPlanName(plan.durationDays)
                        .toLowerCase()
                        .includes(query) ||
                    plan.currency
                        .toLowerCase()
                        .includes(query) ||
                    String(plan.price).includes(query) ||
                    String(plan.durationDays).includes(query)
                );
            })
            .sort(
                (a, b) =>
                    a.durationDays - b.durationDays,
            );
    }, [plans, search, filter]);

    /* =================================================
       ACTIVATE PLAN
    ================================================= */

    async function handleActivatePlan(
        plan: AdminBoostPlan,
    ) {
        try {
            await updateMutation.mutateAsync({
                planId: plan.id,
                input: {
                    active: 1,
                },
            });

            toast.success(
                "Boost plan activated successfully.",
            );
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "Unable to activate boost plan.",
                ),
            );
        }
    }

    /* =================================================
       MODAL HANDLERS
    ================================================= */

    function openCreateModal() {
        setSelectedPlan(null);
        setModalOpen(true);
    }

    function openEditModal(plan: AdminBoostPlan) {
        setSelectedPlan(plan);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setSelectedPlan(null);
    }

    /* =================================================
       RENDER
    ================================================= */

    return (
        <div className="min-h-screen bg-[#F7FAFE] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px] space-y-7">

                {/* PAGE HEADER */}

                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#1491FF]">
                            <Layers3 size={16} />

                            <span>
                                Marketplace Management
                            </span>

                            <span className="text-slate-300">
                                /
                            </span>

                            <span className="text-slate-500">
                                Boost Plans
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Boost Plans
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Manage listing promotion packages, pricing
                            and availability across the KARMASS marketplace.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            disabled={isFetching}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1491FF] disabled:opacity-50"
                        >
                            <RefreshCw
                                size={16}
                                className={
                                    isFetching
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-[#0877D9]"
                        >
                            <Plus size={18} />
                            Create Boost Plan
                        </button>
                    </div>
                </div>

                {/* SUMMARY CARDS */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Plans"
                        value={stats.total}
                        description="All configured boost packages"
                        icon={Layers3}
                        iconClass="bg-blue-50 text-[#1491FF]"
                    />

                    <StatCard
                        title="Active Plans"
                        value={stats.active}
                        description="Currently available to sellers"
                        icon={CheckCircle2}
                        iconClass="bg-emerald-50 text-emerald-600"
                    />

                    <StatCard
                        title="Inactive Plans"
                        value={stats.inactive}
                        description="Unavailable for new purchases"
                        icon={Clock3}
                        iconClass="bg-amber-50 text-amber-600"
                    />

                    <StatCard
                        title="Total Boost Requests"
                        value={stats.totalBoosts.toLocaleString(
                            "en-NG",
                        )}
                        description="Historical requests across all plans"
                        icon={Activity}
                        iconClass="bg-blue-50 text-[#0877D9]"
                    />
                </div>

                {/* MANAGEMENT PANEL */}

                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">

                    {/* PANEL HEADER */}

                    <div className="border-b border-slate-100 p-5 sm:p-6">
                        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    All Boost Plans
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Configure and monitor your promotion packages.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                {/* SEARCH */}

                                <div className="relative min-w-0 sm:w-72">
                                    <Search
                                        size={17}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Search boost plans..."
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-[#1491FF] focus:bg-white focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                                {/* FILTERS */}

                                <div className="flex rounded-xl bg-slate-100 p-1">
                                    {(
                                        [
                                            "ALL",
                                            "ACTIVE",
                                            "INACTIVE",
                                        ] as PlanFilter[]
                                    ).map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() =>
                                                setFilter(item)
                                            }
                                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                                filter === item
                                                    ? "bg-white text-[#0877D9] shadow-sm"
                                                    : "text-slate-500 hover:text-slate-800"
                                            }`}
                                        >
                                            {item === "ALL"
                                                ? "All"
                                                : item === "ACTIVE"
                                                  ? "Active"
                                                  : "Inactive"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LOADING */}

                    {isLoading ? (
                        <div className="space-y-4 p-6">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-20 animate-pulse rounded-xl bg-[#F4F9FF]"
                                />
                            ))}
                        </div>
                    ) : isError ? (
                        /* ERROR STATE */

                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                                <Activity size={25} />
                            </div>

                            <h3 className="mt-4 font-bold text-slate-900">
                                Unable to load boost plans
                            </h3>

                            <p className="mt-2 max-w-sm text-sm text-slate-500">
                                {getErrorMessage(
                                    error,
                                    "Something went wrong while retrieving boost plans.",
                                )}
                            </p>

                            <button
                                type="button"
                                onClick={() => void refetch()}
                                className="mt-5 flex items-center gap-2 rounded-xl bg-[#1491FF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0877D9]"
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </button>
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        /* EMPTY STATE */

                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#1491FF]">
                                {search || filter !== "ALL" ? (
                                    <Search size={27} />
                                ) : (
                                    <Zap size={27} />
                                )}
                            </div>

                            <h3 className="mt-5 text-base font-bold text-slate-900">
                                {search || filter !== "ALL"
                                    ? "No matching plans"
                                    : "No boost plans yet"}
                            </h3>

                            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                {search || filter !== "ALL"
                                    ? "Try changing your search or filter to find a plan."
                                    : "Create your first boost plan to start offering listing promotions to sellers."}
                            </p>

                            {!search && filter === "ALL" && (
                                <button
                                    type="button"
                                    onClick={openCreateModal}
                                    className="mt-5 flex items-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-[#0877D9]"
                                >
                                    <Plus size={17} />
                                    Create First Plan
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* DESKTOP TABLE */}

                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-[900px] text-left">
                                    <thead className="bg-[#F8FAFC]">
                                        <tr className="border-b border-slate-100">
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Boost Plan
                                            </th>

                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Price
                                            </th>

                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Daily Rate
                                            </th>

                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Total Boosts
                                            </th>

                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Created
                                            </th>

                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {filteredPlans.map((plan) => (
                                            <tr
                                                key={plan.id}
                                                className="group transition hover:bg-[#F8FBFF]"
                                            >
                                                {/* PLAN */}

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF] transition group-hover:bg-[#1491FF] group-hover:text-white">
                                                            <Zap size={20} />
                                                        </div>

                                                        <div>
                                                            <p className="font-bold text-slate-800">
                                                                {getPlanName(
                                                                    plan.durationDays,
                                                                )}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                {plan.durationDays} days of promotion
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* PRICE */}

                                                <td className="px-6 py-5">
                                                    <p className="font-bold text-slate-900">
                                                        {formatCurrency(
                                                            plan.price,
                                                            plan.currency,
                                                        )}
                                                    </p>
                                                </td>

                                                {/* DAILY RATE */}

                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {formatCurrency(
                                                            getPricePerDay(plan),
                                                            plan.currency,
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Per day
                                                    </p>
                                                </td>

                                                {/* TOTAL BOOSTS */}

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-800">
                                                            {Number(
                                                                plan.totalBoosts || 0,
                                                            ).toLocaleString(
                                                                "en-NG",
                                                            )}
                                                        </span>

                                                        <ArrowUpRight
                                                            size={14}
                                                            className="text-slate-300"
                                                        />
                                                    </div>
                                                </td>

                                                {/* STATUS */}

                                                <td className="px-6 py-5">
                                                    <PlanStatus
                                                        active={plan.active}
                                                    />
                                                </td>

                                                {/* CREATED */}

                                                <td className="px-6 py-5">
                                                    <p className="text-sm text-slate-600">
                                                        {formatDate(
                                                            plan.createdAt,
                                                        )}
                                                    </p>
                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            title="Edit plan"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    plan,
                                                                )
                                                            }
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1491FF]"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>

                                                        {plan.active === 1 ? (
                                                            <button
                                                                type="button"
                                                                title="Deactivate plan"
                                                                onClick={() =>
                                                                    setPlanToDeactivate(
                                                                        plan,
                                                                    )
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                                                            >
                                                                <ToggleRight size={18} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                title="Activate plan"
                                                                onClick={() =>
                                                                    void handleActivatePlan(
                                                                        plan,
                                                                    )
                                                                }
                                                                disabled={
                                                                    updateMutation.isPending
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                                                            >
                                                                <ToggleLeft size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE CARDS */}

                            <div className="space-y-3 p-4 lg:hidden">
                                {filteredPlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className="rounded-2xl border border-slate-200 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                                                    <Zap size={20} />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900">
                                                        {getPlanName(
                                                            plan.durationDays,
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Created{" "}
                                                        {formatDate(
                                                            plan.createdAt,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <PlanStatus
                                                active={plan.active}
                                            />
                                        </div>

                                        {/* DETAILS */}

                                        <div className="mt-5 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-400">
                                                    Plan Price
                                                </p>

                                                <p className="mt-1 font-bold text-slate-900">
                                                    {formatCurrency(
                                                        plan.price,
                                                        plan.currency,
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-400">
                                                    Total Boosts
                                                </p>

                                                <p className="mt-1 font-bold text-slate-900">
                                                    {Number(
                                                        plan.totalBoosts || 0,
                                                    ).toLocaleString(
                                                        "en-NG",
                                                    )}
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <p className="text-xs text-slate-400">
                                                    Daily Rate
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                                    {formatCurrency(
                                                        getPricePerDay(plan),
                                                        plan.currency,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* ACTIONS */}

                                        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditModal(plan)
                                                }
                                                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-[#1491FF]"
                                            >
                                                <Edit3 size={15} />
                                                Edit
                                            </button>

                                            {plan.active === 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPlanToDeactivate(
                                                            plan,
                                                        )
                                                    }
                                                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 text-sm font-semibold text-amber-700"
                                                >
                                                    <ToggleRight size={16} />
                                                    Deactivate
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleActivatePlan(
                                                            plan,
                                                        )
                                                    }
                                                    disabled={
                                                        updateMutation.isPending
                                                    }
                                                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 disabled:opacity-50"
                                                >
                                                    <ToggleLeft size={16} />
                                                    Activate
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* FOOTER */}

                            <div className="flex flex-col justify-between gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                                <p className="text-xs text-slate-500">
                                    Showing{" "}
                                    <strong className="text-slate-800">
                                        {filteredPlans.length}
                                    </strong>{" "}
                                    of{" "}
                                    <strong className="text-slate-800">
                                        {plans.length}
                                    </strong>{" "}
                                    boost plans
                                </p>

                                <p className="text-xs text-slate-400">
                                    Plan duration starts after admin approval
                                    of a paid boost request.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* CREATE / EDIT MODAL */}

            <PlanModal
                open={modalOpen}
                plan={selectedPlan}
                onClose={closeModal}
            />

            {/* DEACTIVATE MODAL */}

            <DeactivateDialog
                plan={planToDeactivate}
                onClose={() => setPlanToDeactivate(null)}
            />
        </div>
    );
}