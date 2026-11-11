"use client";

import { ArrowUpRight, FileText, ShieldCheck } from "lucide-react";

export default function PdfCompressorPage() {
  const handleRedirect = () => {
    window.open(
      "https://www.ilovepdf.com/compress_pdf",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <main className="min-h-dvh bg-[#0d1117] text-slate-100 flex flex-col justify-between p-5 sm:p-8 md:p-12 font-sans antialiased selection:bg-slate-800">
      {/* Top Header */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between text-[11px] sm:text-xs tracking-widest uppercase text-slate-500 font-light">
        <span>Grow Tech Studio</span>
        <span>Curated Utilities</span>
      </header>

      {/* Main Single Centered Card */}
      <div className="w-full max-w-md mx-auto my-auto py-4 space-y-6">
        {/* Simple Heading */}
        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            PDF Compressor
          </h1>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            Enterprise cloud compression for vector-sharp documents
          </p>
        </div>

        {/* Minimal Focus Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/25 border border-slate-800/60 text-center space-y-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner">
            <FileText className="w-5 h-5 stroke-[1.5]" />
          </div>

          <p className="text-xs text-slate-300 font-light leading-relaxed max-w-xs mx-auto">
            Direct lossless optimization powered by the industry standard{" "}
            <span className="text-white font-medium">iLovePDF</span> engine.
          </p>

          <button
            onClick={handleRedirect}
            className="w-full bg-slate-100 hover:bg-white active:scale-[0.99] text-slate-950 font-medium py-3 px-5 rounded-2xl transition duration-200 text-xs sm:text-sm tracking-wide shadow-lg shadow-black/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open iLovePDF Compressor</span>
            <ArrowUpRight className="w-4 h-4 stroke-2" />
          </button>

          {/* Minimal Inline Footnote */}
          <div className="pt-1 text-[11px] text-slate-500 font-mono">
            Fast • Secure • Zero tracking
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 text-[11px] text-slate-500 font-light">
        <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5] text-slate-400 shrink-0" />
        <span>Direct redirect • No files stored on our servers</span>
      </footer>
    </main>
  );
}
