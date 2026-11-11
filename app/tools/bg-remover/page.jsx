"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Loader2,
  Check,
  Eraser,
  Brush,
  Undo2,
} from "lucide-react";

export default function BackgroundRemoverPage() {
  const [file, setFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedBlob, setProcessedBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // ব্রাশ সেটিংস
  const [brushMode, setBrushMode] = useState("erase"); // "erase" | "restore"
  const [brushSize, setBrushSize] = useState(25);
  const [bgType, setBgType] = useState("transparent");

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  const colors = [
    {
      id: "transparent",
      label: "Transparent",
      class:
        "bg-[conic-gradient(#334155_25%,#1e293b_0_50%,#334155_0_75%,#1e293b_0)] bg-[size:12px_12px]",
    },
    { id: "#ffffff", label: "White", class: "bg-white" },
    { id: "#38bdf8", label: "Sky Blue", class: "bg-sky-400" },
    { id: "#2563eb", label: "Navy Blue", class: "bg-blue-600" },
    { id: "#ef4444", label: "Red", class: "bg-red-500" },
  ];

  // ১. এআই দিয়ে ব্যাকগ্রাউন্ড কাটার পর ক্যানভাসে লোড করা
  const drawToCanvas = (cutoutBlob, origImg) => {
    const canvas = canvasRef.current;
    if (!canvas || !cutoutBlob) return;

    const img = new Image();
    const url = URL.createObjectURL(cutoutBlob);
    img.src = url;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
    };
  };

  const handleProcessImage = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsLoading(true);
    setProgressText("Initializing AI engine...");

    // অরিজিনাল ছবি লোড করে রাখা (Restore করার কাজে লাগবে)
    const orig = new Image();
    orig.src = URL.createObjectURL(selectedFile);
    orig.onload = () => setOriginalImage(orig);

    try {
      const { removeBackground } = await import("@imgly/background-removal");

      const blob = await removeBackground(selectedFile, {
        progress: (key, current, total) => {
          if (total > 0) {
            const percent = Math.round((current / total) * 100);
            setProgressText(`Loading neural weights: ${percent}%`);
          } else {
            setProgressText("Analyzing foreground edges...");
          }
        },
      });

      setProcessedBlob(blob);
      drawToCanvas(blob, orig);
    } catch (err) {
      console.error("AI Background Removal Error:", err);
      alert("Failed to isolate background. Please try another image.");
    } finally {
      setIsLoading(false);
      setProgressText("");
    }
  };

  // ২. ফ্রি ব্রাশ ড্রয়িং লজিক (Erase & Restore)
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleDraw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);

    if (brushMode === "erase") {
      // মুছে ফেলবে
      ctx.globalCompositeOperation = "destination-out";
      ctx.fill();
    } else if (brushMode === "restore" && originalImage) {
      // আসল ছবি থেকে পুনরুদ্ধার করবে
      ctx.globalCompositeOperation = "source-over";
      ctx.save();
      ctx.clip();
      ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  };

  const startDrawing = (e) => {
    isDrawing.current = true;
    handleDraw(e);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  // ৩. ফাইনাল ডাউনলোড হ্যান্ডলার
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // যদি ব্যাকগ্রাউন্ড কালার দেওয়া থাকে, নতুন ক্যানভাসে মার্চ করে ডাউনলোড
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext("2d");

    if (bgType !== "transparent") {
      ctx.fillStyle = bgType;
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    }
    ctx.drawImage(canvas, 0, 0);

    const link = document.createElement("a");
    link.download = `cutout_${file?.name?.split(".")[0] || "image"}.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  const resetAll = () => {
    setFile(null);
    setOriginalImage(null);
    setProcessedBlob(null);
    setIsLoading(false);
    setBgType("transparent");
  };

  return (
    <main className="min-h-dvh bg-[#0d1117] text-slate-100 flex flex-col justify-between p-4 sm:p-8 md:p-12 font-sans antialiased selection:bg-slate-800">
      <header className="w-full max-w-xl mx-auto flex items-center justify-between text-[11px] sm:text-xs tracking-widest uppercase text-slate-500 font-light">
        <span>Grow Tech Studio</span>
        <span>Neural Edge + Brush</span>
      </header>

      <div className="w-full max-w-xl mx-auto my-auto py-6 sm:py-10 space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-mono tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            AI Cutout + Manual Touch-Up
          </div>
          <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-white">
            Background Remover
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-light max-w-md mx-auto leading-relaxed">
            Auto cutout with precision manual brush to erase or restore details
            for free.
          </p>
        </div>

        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f && f.type.startsWith("image/")) handleProcessImage(f);
            }}
            className={`group w-full rounded-3xl p-10 sm:p-14 text-center cursor-pointer border transition-all duration-300 flex flex-col items-center justify-center space-y-4 ${
              isDragOver
                ? "border-sky-400 bg-sky-500/10 scale-[0.99]"
                : "border-slate-800/60 hover:border-slate-700 bg-slate-900/20 hover:bg-slate-900/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleProcessImage(f);
              }}
            />
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                isDragOver
                  ? "bg-sky-500/20 border-sky-400 text-sky-300 scale-110"
                  : "bg-slate-800/50 border-slate-700/50 text-slate-300 group-hover:scale-110"
              }`}
            >
              <Upload className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-light text-slate-200">
                {isDragOver
                  ? "Drop image right here!"
                  : "Drop portrait or object image"}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-light">
                Supports JPG, PNG & WebP
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full p-4 sm:p-6 rounded-3xl bg-slate-900/25 border border-slate-800/60 space-y-5">
            {/* ক্যানভাস কনটেইনার */}
            <div
              style={{
                backgroundColor: bgType !== "transparent" ? bgType : undefined,
              }}
              className={`relative w-full aspect-square max-h-[360px] rounded-2xl overflow-hidden border border-slate-800/80 flex items-center justify-center ${
                bgType === "transparent"
                  ? "bg-[conic-gradient(#1e293b_25%,#0f172a_0_50%,#1e293b_0_75%,#0f172a_0)] bg-[size:16px_16px]"
                  : ""
              }`}
            >
              {isLoading ? (
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                  <p className="text-xs font-mono text-slate-300 tracking-wide">
                    {progressText || "Processing image..."}
                  </p>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={handleDraw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={handleDraw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full object-contain cursor-crosshair touch-none"
                />
              )}
            </div>

            {/* ব্রাশ কন্ট্রোল ও কালার প্যালেট */}
            {!isLoading && (
              <div className="space-y-4 pt-1 border-t border-slate-800/50">
                {/* ব্রাশ মোড ও সাইজ */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-800/60">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setBrushMode("erase")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer border ${
                        brushMode === "erase"
                          ? "bg-rose-500/10 border-rose-500/40 text-rose-400 font-medium"
                          : "bg-slate-800/40 border-slate-700/40 text-slate-400"
                      }`}
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      Erase
                    </button>
                    <button
                      onClick={() => setBrushMode("restore")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer border ${
                        brushMode === "restore"
                          ? "bg-sky-500/10 border-sky-500/40 text-sky-400 font-medium"
                          : "bg-slate-800/40 border-slate-700/40 text-slate-400"
                      }`}
                    >
                      <Brush className="w-3.5 h-3.5" />
                      Restore
                    </button>
                  </div>

                  {/* ব্রাশ সাইজ স্লাইডার */}
                  <div className="flex items-center gap-2 w-full sm:w-44 text-xs text-slate-400 font-mono">
                    <span className="text-[10px] text-slate-500 uppercase">
                      Size
                    </span>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="w-6 text-right text-slate-300">
                      {brushSize}px
                    </span>
                  </div>
                </div>

                {/* ব্যাকগ্রাউন্ড কালার */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    Backdrop
                  </span>
                  <div className="flex items-center gap-2">
                    {colors.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setBgType(c.id)}
                        className={`w-7 h-7 rounded-xl border flex items-center justify-center transition cursor-pointer ${c.class} ${
                          bgType === c.id
                            ? "border-sky-400 ring-2 ring-sky-400/30 scale-105"
                            : "border-slate-700/60"
                        }`}
                        title={c.label}
                      >
                        {bgType === c.id && (
                          <Check
                            className={`w-3.5 h-3.5 ${c.id === "#ffffff" ? "text-slate-900" : "text-white"}`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* অ্যাকশন বাটন */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={resetAll}
                className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition cursor-pointer"
                title="Process another"
              >
                <RotateCcw className="w-4 h-4 stroke-[1.5]" />
              </button>

              {!isLoading && (
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-slate-100 hover:bg-white active:scale-[0.99] text-slate-950 font-medium py-3 px-5 rounded-2xl transition duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide shadow-lg shadow-black/20 cursor-pointer"
                >
                  <Download className="w-4 h-4 stroke-[1.5]" />
                  <span>Download Output (PNG)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 text-[11px] sm:text-xs text-slate-500 font-light pt-4">
        <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5] text-slate-400 shrink-0" />
        <span>100% In-memory canvas • Erase & Restore precision</span>
      </footer>
    </main>
  );
}
