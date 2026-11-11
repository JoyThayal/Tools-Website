"use client";

import { Download } from "lucide-react";

export default function ImageResultCard({
  fileName,
  compressedSize,
  downloadUrl,
  format,
  formatBytes,
}) {
  const getExtension = () => (format === "image/webp" ? "webp" : "jpg");
  const rawName = fileName?.substring(0, fileName.lastIndexOf(".")) || "image";

  return (
    <div className="w-full pt-1">
      <a
        href={downloadUrl}
        download={`optimized_${rawName}.${getExtension()}`}
        className="w-full bg-slate-100 hover:bg-white active:scale-[0.99] text-slate-950 font-medium py-3.5 px-5 rounded-2xl transition duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide shadow-lg shadow-black/20 cursor-pointer"
      >
        <Download className="w-4 h-4 stroke-[1.5]" />
        <span>Download Image ({formatBytes(compressedSize)})</span>
      </a>
    </div>
  );
}
