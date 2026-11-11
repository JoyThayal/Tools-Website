"use client";

import { useState } from "react";
import {
  Download,
  Loader2,
  Sparkles,
  ShieldCheck,
  Video,
  Music2,
  RotateCcw,
  Link2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

// Render-এর লাইভ ব্যাকএন্ড এন্ডপয়েন্ট
const BACKEND_URL = "https://tools-downloader-backend.onrender.com";

export default function VideoDownloaderPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const handleProcessUrl = async (e) => {
    e?.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError("");
    setVideoData(null);

    try {
      const res = await fetch(`${BACKEND_URL}/get-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to extract media information");
      }

      setVideoData(data);
    } catch (err) {
      setError(err.message || "Failed to process video link.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (formatId, type) => {
    setDownloadingId(formatId);
    const downloadEndpoint = `${BACKEND_URL}/download?url=${encodeURIComponent(
      url,
    )}&formatId=${encodeURIComponent(formatId)}&type=${type}`;

    window.location.href = downloadEndpoint;

    setTimeout(() => {
      setDownloadingId(null);
    }, 2500);
  };

  const resetAll = () => {
    setUrl("");
    setVideoData(null);
    setError("");
    setIsLoading(false);
    setDownloadingId(null);
  };

  return (
    <main className="min-h-dvh bg-[#0d1117] text-slate-100 flex flex-col justify-between p-3.5 sm:p-8 md:p-12 font-sans antialiased selection:bg-slate-800">
      {/* স্টুডিও হেডার */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between text-[10px] sm:text-xs tracking-widest uppercase text-slate-500 font-light">
        <span>Grow Tech Studio</span>
        <span>Universal Extractor</span>
      </header>

      {/* মেইন কন্টেন্ট এলাকা */}
      <div className="w-full max-w-xl mx-auto my-auto py-5 sm:py-8 space-y-5">
        {/* টাইটেল ও সাবটাইটেল */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            Adaptive Quality & Direct Stream
          </div>
          <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-white">
            Video Downloader
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-light max-w-md mx-auto leading-relaxed px-2">
            Extract high-fidelity MP4 and MP3 files across YouTube, Instagram,
            and other platforms with real-time size breakdown.
          </p>
        </div>

        {/* লিঙ্ক ইনপুট ও প্রসেস বক্স */}
        <div className="w-full p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/25 border border-slate-800/60 space-y-4">
          <form onSubmit={handleProcessUrl} className="w-full">
            <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 focus-within:border-sky-500/50 focus-within:ring-1 focus-within:ring-sky-500/30 transition-all">
              <div className="flex items-center flex-1 min-w-0 pl-2">
                <Link2 className="w-4 h-4 stroke-[1.5] text-slate-500 shrink-0 ml-1" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste video or reel link here..."
                  disabled={isLoading}
                  className="w-full bg-transparent py-2.5 px-2.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className={`h-10 px-5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shrink-0 ${
                  isLoading || !url.trim()
                    ? "bg-slate-800/80 text-slate-500 border border-slate-700/40 cursor-not-allowed shadow-none"
                    : "bg-slate-100 hover:bg-white active:scale-95 text-slate-950 shadow-md shadow-black/20 cursor-pointer"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing</span>
                  </>
                ) : (
                  <>
                    <span>Extract</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* এরর স্টেট */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-mono">
              {error}
            </div>
          )}

          {/* লোডিং স্টেট */}
          {isLoading && (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              <p className="text-xs font-mono text-slate-400 tracking-wide">
                Inspecting remote streams and bitrates...
              </p>
            </div>
          )}

          {/* মেটাডেটা ও কোয়ালিটি রেজাল্ট */}
          {videoData && !isLoading && (
            <div className="space-y-4 pt-1">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-950/60 rounded-2xl border border-slate-800 items-start sm:items-center">
                {videoData.thumbnail && (
                  <div className="relative w-full sm:w-40 h-32 sm:h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 shadow-md">
                    <img
                      src={videoData.thumbnail}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1.5 w-full">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Ready to Download
                  </div>
                  <h3 className="text-xs sm:text-sm font-normal text-slate-200 line-clamp-2 leading-relaxed">
                    {videoData.title}
                  </h3>
                </div>
              </div>

              {/* কোয়ালিটি তালিকা */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500 font-mono px-1">
                  <span>Quality</span>
                  <span>File Size & Action</span>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {videoData.qualities?.map((q, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-slate-950/40 hover:bg-slate-900/60 border border-slate-800/60 hover:border-slate-700/80 transition-all"
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${
                            q.type === "audio"
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              : "bg-sky-500/10 border-sky-500/30 text-sky-400"
                          }`}
                        >
                          {q.type === "audio" ? (
                            <Music2 className="w-3.5 h-3.5" />
                          ) : (
                            <Video className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-medium text-slate-200 truncate">
                            {q.quality}
                          </span>
                          <span className="text-[9px] font-mono uppercase text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/50 shrink-0">
                            {q.ext}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                        <span className="text-[11px] sm:text-xs font-mono text-slate-400 whitespace-nowrap">
                          {q.sizeText}
                        </span>
                        <button
                          onClick={() => handleDownload(q.formatId, q.type)}
                          disabled={downloadingId === q.formatId}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-white text-slate-950 font-medium text-xs transition active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {downloadingId === q.formatId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>Get</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* রিসেট বাটন */}
              <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Process another URL</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* স্টুডিও ফুটার */}
      <footer className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 text-[10px] sm:text-xs text-slate-500 font-light pt-3">
        <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5] text-slate-400 shrink-0" />
        <span>Lossless Pipeline • Multi-format streaming</span>
      </footer>
    </main>
  );
}
