"use client";

import { FileVideo, X } from "lucide-react";

export default function FileCard({ file, onRemove, disabled }) {
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <FileVideo className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
            {file.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
              {formatFileSize(file.size)}
            </span>
            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {file.name.split(".").pop()?.toUpperCase() || "VIDEO"}
            </span>
          </div>
        </div>
      </div>

      {!disabled && (
        <button
          onClick={onRemove}
          className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
          title="Remove file"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
}
