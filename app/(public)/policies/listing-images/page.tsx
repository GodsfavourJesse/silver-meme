import Link from "next/link";
import { ArrowLeft, CheckCircle2, ImageIcon, ShieldCheck } from "lucide-react";

const rules = [
  {
    title: "Use genuine photos of the vehicle",
    body: "Upload clear photos that represent the actual vehicle being listed. Do not use stock photos, images copied from another seller, or photos of a different vehicle.",
  },
  {
    title: "Avoid duplicate or reused images",
    body: "KARMASS checks for exact and visually similar images across the marketplace. If a photo matches an existing listing, replace it with a new photo you took yourself or have permission to use.",
  },
  {
    title: "Keep photos clean and readable",
    body: "Do not add promotional banners, contact details, pricing stickers, or other overlays that obscure the vehicle. Watermark detection depends on the checks enabled by KARMASS and may not identify every watermark.",
  },
  {
    title: "Show the vehicle clearly",
    body: "Use well-lit, in-focus images. Include useful angles such as the front, rear, both sides, interior, dashboard, odometer where appropriate, and any material damage.",
  },
  {
    title: "Understand verification results",
    body: "Passed means the enabled automated checks did not identify a blocking issue. Needs review means a human or additional check may be required. Failed means the image needs to be replaced or corrected before submission. A technical verification error is not the same as a failed image.",
  },
  {
    title: "If a photo fails",
    body: "Read the reason shown beside the photo, replace the image with a compliant original, and wait for its new checks to finish. If you believe the result is incorrect, contact KARMASS support with your listing ID and the affected photo details.",
  },
];

export default function ListingImagePolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"><ArrowLeft size={16} /> Back to KARMASS</Link>
        <header className="mt-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#7008E7] via-purple-700 to-indigo-900 p-7 text-white shadow-xl shadow-purple-200 sm:p-11">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10"><ImageIcon size={24} /></div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-purple-200">Seller standards</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Listing image policy</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-purple-100 sm:text-base">Clear, genuine vehicle photos help buyers make informed decisions and keep the KARMASS marketplace trustworthy.</p>
        </header>
        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-900"><ShieldCheck className="mt-0.5 shrink-0" size={20} /><p className="text-sm leading-6">Images are checked before submission and may be checked again during administrator review. Automated checks support moderation; they do not guarantee that every issue will be detected.</p></div>
          <div className="mt-7 space-y-6">
            {rules.map((rule, index) => <article key={rule.title} className="flex gap-4 border-b border-slate-100 pb-6 last:border-0 last:pb-0"><div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-sm font-bold text-[#7008E7]">{String(index + 1).padStart(2, "0")}</div><div><h2 className="text-base font-bold text-slate-900">{rule.title}</h2><p className="mt-2 text-sm leading-7 text-slate-600">{rule.body}</p></div></article>)}
          </div>
          <div className="mt-8 rounded-2xl border border-purple-100 bg-purple-50 p-5"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-[#7008E7]" size={20}/><div><h2 className="font-bold text-slate-900">Ready to continue?</h2><p className="mt-1 text-sm leading-6 text-slate-600">Return to your listing, correct any flagged photos, and wait until the verification status is clear before submitting.</p><Link href="/dashboard/my-listings" className="mt-4 inline-flex rounded-xl bg-[#7008E7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800">Go to my listings</Link></div></div></div>
        </section>
      </div>
    </main>
  );
}
