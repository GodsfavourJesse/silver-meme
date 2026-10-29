"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    AlertCircle,
    CheckCircle2,
    FileText,
    LoaderCircle,
    UploadCloud,
    X,
} from "lucide-react";
import { toast } from "sonner";

import {
    DEALER_DOCUMENT_ACCEPT,
    DEALER_DOCUMENT_MAX_SIZE,
    DEALER_DOCUMENT_TYPES,
} from "./dealer-doument.contants";
import { useUploadDealerDocument } from "@/app/hooks/user/dealer/useDealer";

interface DealerDocumentUploadProps {
    applicationId: string;
    onUploaded?: () => void;
}

export default function DealerDocumentUpload({
    applicationId,
    onUploaded,
}: DealerDocumentUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [documentType, setDocumentType] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState("");

    const uploadMutation = useUploadDealerDocument();

    const validateFile = (file: File): string | null => {
        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            return "Choose a PDF, JPG, PNG, or WebP file.";
        }

        if (file.size > DEALER_DOCUMENT_MAX_SIZE) {
            return "The selected file exceeds the 5 MB limit.";
        }

        if (file.size === 0) {
            return "The selected file is empty.";
        }

        return null;
    };

    const handleFileChange = (file?: File) => {
        setError("");

        if (!file) {
            setSelectedFile(null);
            return;
        }

        const validationError = validateFile(file);

        if (validationError) {
            setSelectedFile(null);
            setError(validationError);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!applicationId) {
            setError("Your application ID is missing.");
            return;
        }

        if (!documentType) {
            setError("Select a document type.");
            return;
        }

        if (!selectedFile) {
            setError("Choose a document to upload.");
            return;
        }

        setError("");

        try {
            await uploadMutation.mutateAsync({
                applicationId,
                documentType,
                file: selectedFile,
            });

            toast.success("Document uploaded successfully.");

            setSelectedFile(null);
            setDocumentType("");

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            onUploaded?.();
        } catch (uploadError) {
            const message =
                uploadError instanceof Error
                    ? uploadError.message
                    : "Unable to upload your document.";

            setError(message);
            toast.error(message);
        }
    };

    const isUploading = uploadMutation.isPending;

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-7"
        >
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-[#7008E7]">
                    <UploadCloud size={24} />
                </div>

                <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                        Upload a document
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        Add supporting documents for your dealer
                        verification application.
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <label
                    htmlFor="dealerDocumentType"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                >
                    Document type
                </label>

                <select
                    id="dealerDocumentType"
                    value={documentType}
                    onChange={(event) => {
                        setDocumentType(event.target.value);
                        setError("");
                    }}
                    disabled={isUploading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#7008E7] focus:ring-4 focus:ring-purple-50 disabled:opacity-60"
                >
                    <option value="">Select document type</option>

                    {DEALER_DOCUMENT_TYPES.map((document) => (
                        <option
                            key={document.value}
                            value={document.value}
                        >
                            {document.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mt-5">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={DEALER_DOCUMENT_ACCEPT}
                    disabled={isUploading}
                    onChange={(event) =>
                        handleFileChange(event.target.files?.[0])
                    }
                    className="sr-only"
                    id="dealerDocumentFile"
                />

                <label
                    htmlFor="dealerDocumentFile"
                    className={`flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
                        selectedFile
                            ? "border-purple-300 bg-purple-50"
                            : "border-slate-200 bg-slate-50 hover:border-purple-300 hover:bg-purple-50/50"
                    } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#7008E7] shadow-sm">
                        {selectedFile ? (
                            <FileText size={23} />
                        ) : (
                            <UploadCloud size={23} />
                        )}
                    </div>

                    <p className="mt-3 break-all text-sm font-bold text-slate-800">
                        {selectedFile
                            ? selectedFile.name
                            : "Choose a document to upload"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        PDF, JPG, PNG or WebP · Maximum 5 MB
                    </p>

                    {selectedFile && (
                        <p className="mt-2 text-xs font-semibold text-[#7008E7]">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    )}
                </label>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 flex items-start gap-2 overflow-hidden rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
                    >
                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                        />

                        <p className="flex-1 leading-5">{error}</p>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !documentType}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7008E7] px-5 py-3 text-sm font-bold text-white shadow-md shadow-purple-100 transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isUploading ? (
                    <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Uploading document...
                    </>
                ) : (
                    <>
                        <CheckCircle2 size={18} />
                        Upload document
                    </>
                )}
            </motion.button>

            <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                Documents are submitted for verification and may contain
                sensitive business information.
            </p>
        </motion.section>
    );
}