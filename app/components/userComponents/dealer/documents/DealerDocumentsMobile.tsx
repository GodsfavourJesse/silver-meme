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
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import type { DealerDocument } from "@/app/types/user/dealer/dealer.types";
import DealerDocumentUpload from "./DealerDocumentUpload";
import DealerDocumentCard from "./DealerDocumentCard";
import { useDealerDocuments } from "@/app/hooks/user/dealer/useDealer";

interface DealerDocumentsMobileProps {
  applicationId: string;
}

const ACCENT = "#7008E7";

function StatusSummary({
  icon: Icon,
  label,
  count,
  tone,
}: {
  icon: typeof FileText;
  label: string;
  count: number;
  tone: "purple" | "green" | "red";
}) {
  const styles = {
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <div className={`rounded-2xl border p-3 ${styles[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <Icon size={17} />
        <span className="text-xl font-bold">{count}</span>
      </div>
      <p className="mt-2 text-xs font-medium">{label}</p>
    </div>
  );
}

export default function DealerDocumentsMobile({
  applicationId,
}: DealerDocumentsMobileProps) {
  const router = useRouter();

  const {
    data: documents = [],
    isLoading,
    isError,
    refetch,
  } = useDealerDocuments(applicationId);

  const summary = useMemo(() => {
    const docs = documents as DealerDocument[];

    return {
      total: docs.length,
      pending: docs.filter((doc) => doc.status === "PENDING").length,
      approved: docs.filter((doc) => doc.status === "APPROVED").length,
      rejected: docs.filter((doc) => doc.status === "REJECTED").length,
    };
  }, [documents]);

  if (!applicationId) {
    return (
      <main className="min-h-screen bg-[#F8F7FC] px-5 py-10">
        <div className="mx-auto max-w-md rounded-3xl border border-rose-100 bg-white p-6 text-center shadow-sm">
          <XCircle className="mx-auto text-rose-500" size={38} />
          <h1 className="mt-4 text-lg font-bold text-gray-900">
            Application not found
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            We couldn't identify your dealer application. Open your application
            again to continue document verification.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dealer/apply")}
            className="mt-5 w-full rounded-xl bg-[#7008E7] px-4 py-3 text-sm font-semibold text-white"
          >
            Return to application
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F7FC] pb-10 md:hidden">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-700"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-gray-900">
              Dealer verification
            </h1>
            <p className="mt-0.5 text-xs text-gray-500">
              Manage your business documents
            </p>
          </div>

          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${ACCENT}12`, color: ACCENT }}
          >
            <ShieldCheck size={21} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-xl space-y-5 px-4 pt-5">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100"
        >
          <div
            className="relative overflow-hidden px-5 py-6 text-white"
            style={{
              background: "linear-gradient(135deg, #7008E7, #4F20B8)",
            }}
          >
            <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 right-16 h-28 w-28 rounded-full bg-white/5" />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <BadgeCheck size={27} />
              </div>

              <h2 className="mt-4 text-xl font-bold">
                Get your dealer profile verified
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-purple-100">
                Upload supporting documents so the review team can verify your
                business information.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4">
            <StatusSummary
              icon={FileCheck2}
              label="Uploaded"
              count={summary.total}
              tone="purple"
            />
            <StatusSummary
              icon={Clock3}
              label="In review"
              count={summary.pending}
              tone="purple"
            />
            <StatusSummary
              icon={BadgeCheck}
              label="Approved"
              count={summary.approved}
              tone="green"
            />
          </div>

          {summary.rejected > 0 && (
            <div className="mx-4 mb-4 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
              <XCircle size={16} />
              {summary.rejected} document
              {summary.rejected === 1 ? " needs" : "s need"} attention.
              Review the rejection reason below.
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className="mb-3">
            <h2 className="text-base font-bold text-gray-900">
              Upload a document
            </h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Use clear, readable files. Accepted formats and size limits are
              enforced during upload.
            </p>
          </div>

          <DealerDocumentUpload applicationId={applicationId} />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Your documents
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Track each document's review status.
              </p>
            </div>

            <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
              {summary.total} total
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4"
                >
                  <div className="flex gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gray-100" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-2/3 rounded bg-gray-100" />
                      <div className="h-3 w-1/3 rounded bg-gray-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-rose-100 bg-white p-5 text-center">
              <XCircle className="mx-auto text-rose-500" size={30} />
              <p className="mt-3 text-sm font-semibold text-gray-900">
                Couldn't load your documents
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: ACCENT }}
              >
                Try again
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-purple-200 bg-white px-5 py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <FileText size={26} />
              </div>
              <h3 className="mt-4 text-sm font-bold text-gray-900">
                No documents uploaded yet
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-gray-500">
                Upload your first supporting document using the form above.
                You can track its review status here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document, index) => (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, y: 10 }}
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

        <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-purple-700"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Keep your documents secure
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-600">
                Uploaded documents are private. Access is controlled by the
                verification system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}