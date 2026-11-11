"use client";

import { X, Image as ImageIcon } from "lucide-react";

export default function ImageSettingsCard({
  file,
  originalSize,
  quality,
  setQuality,
  format,
  setFormat,
  onReset,
  compressedSize,
  previewUrl,
  formatBytes,
}) {
  const reduction =
    originalSize > 0 && compressedSize > 0
      ? Math.max(
          0,
          Math.round(((originalSize - compressedSize) / originalSize) * 100),
        )
      : 0;

  return (
    <div className="w-full p-5 sm:p-7 rounded-3xl bg-slate-900/25 border border-slate-800/60 space-y-5">
      {/* File & Live Size Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-10 h-10 rounded-xl object-cover border border-slate-700/60 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-800/60 flex items-center justify-center text-slate-400 shrink-0">
              <ImageIcon className="w-5 h-5 stroke-[1.5]" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-200 truncate">
              {file.name}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              {formatBytes(originalSize)}
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-full hover:bg-slate-800/50 transition cursor-pointer shrink-0"
          title="Remove"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>
      </div>

      {/* Format Selector */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { id: "image/webp", label: "WebP" },
          { id: "image/jpeg", label: "JPEG" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFormat(f.id)}
            className={`py-2 px-3 rounded-xl text-xs font-mono transition cursor-pointer border ${
              format === f.id
                ? "bg-slate-100 text-slate-950 font-semibold border-white"
                : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Minimal Slider Section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-medium">
            Quality
          </span>
          <span className="text-slate-100 font-mono font-medium">
            {Math.round(quality * 100)}%
          </span>
        </div>

        <input
          type="range"
          min="0.1"
          max="0.95"
          step="0.05"
          value={quality}
          onChange={(e) => setQuality(parseFloat(e.target.value))}
          className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer transition-all"
        />
      </div>

      {/* Compact Live Result Metric */}
      <div className="pt-2 flex items-center justify-between text-xs">
        <span className="text-slate-500 text-[11px]">Optimized size</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-mono font-medium text-sm">
            {formatBytes(compressedSize)}
          </span>
          {reduction > 0 && (
            <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              -{reduction}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
