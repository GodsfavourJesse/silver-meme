"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  FileCheck2,
  FileText,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import type { DealerDocument } from "@/app/types/user/dealer/dealer.types";
import DealerDocumentUpload from "./DealerDocumentUpload";
import DealerDocumentCard from "./DealerDocumentCard";
import { useDealerDocuments } from "@/app/hooks/user/dealer/useDealer";

interface DealerDocumentsDesktopProps {
  applicationId: string;
}

const ACCENT = "#7008E7";

function DocumentMetric({
  icon: Icon,
  label,
  value,
  description,
  tone,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  description: string;
  tone: "purple" | "green" | "red";
}) {
  const colors = {
    purple: "bg-purple-50 text-purple-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${colors[tone]}`}>
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">{description}</p>
    </div>
  );
}

export default function DealerDocumentsDesktop({
  applicationId,
}: DealerDocumentsDesktopProps) {
  const router = useRouter();

  const {
    data: documents = [],
    isLoading,
    isError,
    refetch,
  } = useDealerDocuments(applicationId);

  const stats = useMemo(() => {
    const items = documents as DealerDocument[];

    return {
      total: items.length,
      pending: items.filter((item) => item.status === "PENDING").length,
      approved: items.filter((item) => item.status === "APPROVED").length,
      rejected: items.filter((item) => item.status === "REJECTED").length,
    };
  }, [documents]);

  if (!applicationId) {
    return (
      <main className="hidden min-h-screen items-center justify-center bg-[#F8F7FC] p-8 md:flex">
        <section className="max-w-lg rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto text-rose-500" size={42} />
          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Application not found
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            We couldn't identify your dealer application. Return to the
            application page and continue from there.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dealer/apply")}
            className="mt-6 rounded-xl px-5 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: ACCENT }}
          >
            Return to application
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="hidden min-h-screen bg-[#F8F7FC] md:block">
      <div className="mx-auto max-w-7xl px-8 py-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: `${ACCENT}12`,
                    color: ACCENT,
                  }}
                >
                  <ShieldCheck size={25} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Dealer verification
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload and manage your business verification documents.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-purple-100 bg-white px-4 py-2.5 text-sm font-medium text-purple-700 shadow-sm">
              <BadgeCheck size={17} />
              Document management
            </div>
          </div>
        </motion.div>

        <section className="mb-8 grid grid-cols-4 gap-5">
          <DocumentMetric
            icon={FileText}
            label="Total documents"
            value={stats.total}
            description="Documents uploaded"
            tone="purple"
          />
          <DocumentMetric
            icon={Clock3}
            label="Under review"
            value={stats.pending}
            description="Awaiting a decision"
            tone="purple"
          />
          <DocumentMetric
            icon={BadgeCheck}
            label="Approved"
            value={stats.approved}
            description="Successfully reviewed"
            tone="green"
          />
          <DocumentMetric
            icon={XCircle}
            label="Needs attention"
            value={stats.rejected}
            description="Review rejection feedback"
            tone="red"
          />
        </section>

        <div className="grid grid-cols-12 items-start gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
            className="col-span-5 space-y-5"
          >
            <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div
                className="relative overflow-hidden px-6 py-7 text-white"
                style={{
                  background: "linear-gradient(135deg, #7008E7, #4F20B8)",
                }}
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                    <UploadCloud size={25} />
                  </div>

                  <h2 className="mt-5 text-xl font-bold">
                    Upload verification documents
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-purple-100">
                    Add the documents needed to verify your dealer business.
                    Ensure every file is clear and readable.
                  </p>
                </div>
              </div>

              <div className="p-6">
                <DealerDocumentUpload applicationId={applicationId} />
              </div>
            </section>

            <section className="rounded-2xl border border-purple-100 bg-purple-50/70 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={21}
                  className="mt-0.5 shrink-0 text-purple-700"
                />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Your documents stay private
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Uploaded documents are stored privately. Access to them is
                    controlled by the verification system.
                  </p>
                </div>
              </div>
            </section>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 }}
            className="col-span-7 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Uploaded documents
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Monitor the review status of each document.
                </p>
              </div>

              <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                {stats.total} total
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-gray-100 p-5"
                  >
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gray-100" />
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-4 w-1/2 rounded bg-gray-100" />
                        <div className="h-3 w-1/3 rounded bg-gray-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-8 text-center">
                <XCircle className="mx-auto text-rose-500" size={34} />
                <h3 className="mt-3 font-semibold text-gray-900">
                  Couldn't load documents
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Check your connection and try again.
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  Try again
                </button>
              </div>
            ) : documents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-purple-200 px-8 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <FileCheck2 size={30} />
                </div>

                <h3 className="mt-4 font-bold text-gray-900">
                  No documents uploaded
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  Your uploaded documents will appear here. Use the form on the
                  left to submit your first document for review.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((document, index) => (
                  <motion.div
                    key={document.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <DealerDocumentCard
                      document={document}
                      applicationId={applicationId}
                      canDelete={document.status !== "APPROVED"}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </main>
  );
}