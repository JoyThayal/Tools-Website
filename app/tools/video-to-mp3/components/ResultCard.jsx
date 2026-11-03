"use client";

import { CheckCircle2, Download } from "lucide-react";
import AudioTrimmer from "./AudioTrimmer";

export default function ResultCard({ audioUrl, fileName, onReset, ffmpegRef }) {
  const downloadName = `${fileName ? fileName.replace(/\.[^/.]+$/, "") : "audio"}.mp3`;

  return (
    <div className="mt-5 sm:mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-400 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Extracted Successfully!</span>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] sm:text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-2 shrink-0"
        >
          Convert Another
        </button>
      </div>

      <div className="w-full overflow-hidden rounded-lg">
        <audio
          controls
          src={audioUrl}
          className="w-full h-9 sm:h-10 outline-none"
        />
      </div>

      <a
        href={audioUrl}
        download={downloadName}
        className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg shadow-emerald-500/20"
      >
        <Download className="w-4 h-4" />
        <span>Download Full MP3</span>
      </a>

      {/* MP3 হয়ে যাওয়ার পর নিচে আসবে এই ট্রিমার অপশন */}
      <AudioTrimmer
        audioUrl={audioUrl}
        fileName={fileName}
        ffmpegRef={ffmpegRef}
      />
    </div>
  );
}
