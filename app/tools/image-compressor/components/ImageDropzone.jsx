"use client";

import { useRef, useState } from "react";
import { ImageUp } from "lucide-react";

export default function ImageDropzone({ onFileSelect }) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`group relative w-full rounded-3xl p-8 sm:p-14 md:p-16 text-center cursor-pointer transition-all duration-300 border flex flex-col items-center justify-center ${
        isDragOver
          ? "border-sky-400/80 bg-sky-500/[0.04] scale-[0.99]"
          : "border-slate-800/60 hover:border-slate-700 bg-slate-900/20 hover:bg-slate-900/40"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />

      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:scale-110 transition-all duration-300 mb-4 sm:mb-5 shadow-inner">
        <ImageUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
      </div>

      <h3 className="text-sm sm:text-lg font-light text-slate-200 tracking-wide px-2">
        Select or drop an image
      </h3>
      <p className="text-[11px] sm:text-xs text-slate-500 font-light mt-1 sm:mt-1.5 max-w-xs leading-relaxed px-4">
        JPG, PNG, WebP supported. Instant client-side compression.
      </p>

      <span className="mt-5 sm:mt-6 text-[10px] sm:text-[11px] font-medium tracking-wider uppercase text-slate-400 bg-slate-800/40 px-3.5 py-1.5 rounded-full border border-slate-700/40 group-hover:border-slate-600 transition-colors">
        Choose File
      </span>
    </div>
  );
}
