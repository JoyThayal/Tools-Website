"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export default function Dropzone({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center select-none group ${
        isDragging
          ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]"
          : "border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/70 active:bg-slate-950/80"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800/80 group-hover:bg-indigo-600/20 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors mb-3 sm:mb-4 border border-slate-700/60">
        <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
      </div>
      <p className="text-sm sm:text-base font-semibold text-slate-200 group-hover:text-white transition-colors">
        Drag & drop video, or{" "}
        <span className="text-indigo-400 underline underline-offset-4">
          browse
        </span>
      </p>
      <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 sm:mt-2">
        MP4, MKV, MOV, WebM (Recommended under 500 MB)
      </p>
    </div>
  );
}
