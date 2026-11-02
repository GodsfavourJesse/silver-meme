"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Layers3,
    Plus,
    RefreshCw,
    ShieldCheck,
    Wallet,
} from "lucide-react";
import { toast } from "sonner";

import type {
    AdminSubscriptionPlan,
    CreateAdminSubscriptionPlanPayload,
    UpdateAdminSubscriptionPlanPayload,
} from "@/app/types/admin/admin-subscription.types";
import { useAdminSubscriptionPlans } from "@/app/hooks/admin/subscriptions/useAdminSubscriptionPlans";
import { useCreateSubscriptionPlan } from "@/app/hooks/admin/subscriptions/useCreateSubscriptionPlan";
import { useUpdateSubscriptionPlan } from "@/app/hooks/admin/subscriptions/useUpdateSubscriptionPlan";
import AdminSubscriptionPlansTable from "@/app/components/adminComponents/admin-subscriptions/AdminSubscriptionPlansTable";
import AdminSubscriptionPlanForm from "@/app/components/adminComponents/admin-subscriptions/AdminSubscriptionPlanForm";

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                    {title}
                </p>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1491FF]">
                    <Icon size={20} />
                </div>
            </div>

            <h3 className="mt-4 text-2xl font-bold tracking-tight text-gray-950">
                {value}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
                {description}
            </p>
        </div>
    );
}

export default function AdminSubscriptionPlansPage() {
    const [showForm, setShowForm] = useState(false);

    const [selectedPlan, setSelectedPlan] =
        useState<AdminSubscriptionPlan | null>(null);

    const {
        data: plans = [],
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useAdminSubscriptionPlans();

    const createMutation = useCreateSubscriptionPlan();
    const updateMutation = useUpdateSubscriptionPlan();

    const isSubmitting =
        createMutation.isPending ||
        updateMutation.isPending;

    const activePlans = plans.filter(
        (plan) => plan.active,
    ).length;

    const inactivePlans = plans.length - activePlans;

    const totalVersions = plans.reduce(
        (total, plan) => total + plan.versions.length,
        0,
    );

    function openCreateForm() {
        setSelectedPlan(null);
        setShowForm(true);
    }

    function openEditForm(plan: AdminSubscriptionPlan) {
        setSelectedPlan(plan);
        setShowForm(true);
    }

    function closeForm() {
        if (isSubmitting) return;

        setShowForm(false);
        setSelectedPlan(null);
    }

    async function handleSubmit(
        payload:
            | CreateAdminSubscriptionPlanPayload
            | UpdateAdminSubscriptionPlanPayload,
    ) {
        try {
            if (selectedPlan) {
                await updateMutation.mutateAsync({
                    planId: selectedPlan.id,
                    data: payload as UpdateAdminSubscriptionPlanPayload,
                });

                toast.success(
                    "Subscription plan updated successfully.",
                );
            } else {
                await createMutation.mutateAsync(
                    payload as CreateAdminSubscriptionPlanPayload,
                );

                toast.success(
                    "Subscription plan created successfully.",
                );
            }

            setShowForm(false);
            setSelectedPlan(null);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to save subscription plan.",
            );
        }
    }

    return (
        <main className="mx-auto w-full max-w-[1600px] space-y-7 px-4 py-7 sm:px-6 md:px-28">
            {/* Header */}
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                    <Link
                        href="/ops-center-7k9x/dashboard/subscriptions"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1491FF]"
                    >
                        <ArrowLeft size={16} />
                        Back to subscriptions
                    </Link>

                    <div className="flex items-center gap-2 text-sm font-semibold text-[#1491FF]">
                        <Layers3 size={17} />
                        Subscription management
                    </div>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                        Subscription plans
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                        Create and manage subscription offerings,
                        pricing, listing credits and dealer benefits.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={isFetching ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={openCreateForm}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0877D9]"
                    >
                        <Plus size={18} />
                        Create plan
                    </button>
                </div>
            </div>

            {/* Summary */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Total plans"
                    value={isLoading ? "—" : plans.length}
                    description="All configured subscription plans"
                    icon={Layers3}
                />

                <SummaryCard
                    title="Active plans"
                    value={isLoading ? "—" : activePlans}
                    description="Currently available for purchase"
                    icon={CheckCircle2}
                />

                <SummaryCard
                    title="Inactive plans"
                    value={isLoading ? "—" : inactivePlans}
                    description="Unavailable to new customers"
                    icon={ShieldCheck}
                />

                <SummaryCard
                    title="Plan versions"
                    value={isLoading ? "—" : totalVersions}
                    description="Historical pricing configurations"
                    icon={Wallet}
                />
            </section>

            {/* Error */}
            {isError && (
                <div className="flex flex-col justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center">
                    <div>
                        <h3 className="font-semibold text-red-900">
                            Unable to load subscription plans
                        </h3>

                        <p className="mt-1 text-sm text-red-700">
                            {error instanceof Error
                                ? error.message
                                : "Something went wrong while loading plans."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    >
                        <RefreshCw size={15} />
                        Try again
                    </button>
                </div>
            )}

            {/* Plans table */}
            <AdminSubscriptionPlansTable
                plans={plans}
                isLoading={isLoading}
                onEdit={openEditForm}
            />

            {/* Form modal */}
            {showForm && (
                <AdminSubscriptionPlanForm
                    plan={selectedPlan}
                    isSubmitting={isSubmitting}
                    onClose={closeForm}
                    onSubmit={handleSubmit}
                />
            )}
        </main>
    );
}