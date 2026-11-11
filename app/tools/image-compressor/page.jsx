"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ShieldCheck } from "lucide-react";

import ImageDropzone from "./components/ImageDropzone";
import ImageSettingsCard from "./components/ImageSettingsCard";
import ImageResultCard from "./components/ImageResultCard";

export const dynamic = "force-dynamic";

export default function ImageCompressorPage() {
  const [file, setFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedBlobUrl, setCompressedBlobUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // ডিফল্ট স্টেট
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState("image/webp");

  const imageElementRef = useRef(null);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // স্মার্ট অটো কোয়ালিটি ক্যালকুলেশন
  const calculateAutoQuality = (fileSizeBytes) => {
    const sizeInMB = fileSizeBytes / (1024 * 1024);

    if (sizeInMB >= 3) {
      return 0.7; // বড় ছবির ক্ষেত্রে 70% এ চমৎকার ভিজ্যুয়াল ও ৮০% সাইজ কমে
    } else if (sizeInMB >= 1) {
      return 0.78; // ১-৩ MB ছবির জন্য সেরা ব্যালান্স
    } else if (fileSizeBytes > 300 * 1024) {
      return 0.85; // ৩00 KB থেকে ১ MB ছবির জন্য হাই কোয়ালিটি
    } else {
      return 0.65; // ৩০০ KB-র কম ছবির সাইজ বৃদ্ধি আটকানোর সেফগার্ড
    }
  };

  const processImage = useCallback(() => {
    if (!imageElementRef.current || !file) return;

    const img = imageElementRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    let targetQuality = quality;
    if (file.size < 300 * 1024) {
      targetQuality = Math.min(quality, 0.65);
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        // সেফগার্ড: সাইজ যদি অরিজিনালের সমান বা বেশি হয়ে যায়
        if (blob.size >= file.size) {
          canvas.toBlob(
            (fallbackBlob) => {
              if (fallbackBlob) {
                if (compressedBlobUrl) URL.revokeObjectURL(compressedBlobUrl);
                setCompressedBlobUrl(URL.createObjectURL(fallbackBlob));
                setCompressedSize(fallbackBlob.size);
              }
            },
            format,
            Math.max(0.2, targetQuality * 0.7),
          );
          return;
        }

        if (compressedBlobUrl) URL.revokeObjectURL(compressedBlobUrl);
        const newUrl = URL.createObjectURL(blob);
        setCompressedBlobUrl(newUrl);
        setCompressedSize(blob.size);
      },
      format,
      targetQuality,
    );
  }, [quality, format, file, compressedBlobUrl]);

  // ছবি ড্রপ করার সাথে সাথে স্মার্ট অটো সিলেকশন
  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);

    // ১. স্মার্ট অটো কোয়ালিটি বের করা
    const autoQuality = calculateAutoQuality(selectedFile.size);
    setQuality(autoQuality);

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
      imageElementRef.current = img;

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          if (blob.size >= selectedFile.size) {
            canvas.toBlob(
              (fallbackBlob) => {
                if (fallbackBlob) {
                  setCompressedBlobUrl(URL.createObjectURL(fallbackBlob));
                  setCompressedSize(fallbackBlob.size);
                }
              },
              format,
              Math.max(0.2, autoQuality * 0.7),
            );
            return;
          }

          setCompressedBlobUrl(URL.createObjectURL(blob));
          setCompressedSize(blob.size);
        },
        format,
        autoQuality,
      );
    };
  };

  useEffect(() => {
    if (imageElementRef.current && file) {
      processImage();
    }
  }, [quality, format]);

  const resetAll = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (compressedBlobUrl) URL.revokeObjectURL(compressedBlobUrl);
    setFile(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setCompressedBlobUrl(null);
    setPreviewUrl(null);
    imageElementRef.current = null;
  };

  return (
    <main className="min-h-dvh bg-[#0d1117] text-slate-100 flex flex-col justify-between p-4 sm:p-8 md:p-12 font-sans antialiased selection:bg-slate-800">
      <header className="w-full max-w-xl mx-auto flex items-center justify-between text-[11px] sm:text-xs tracking-widest uppercase text-slate-500 font-light">
        <span>Grow Tech Studio</span>
        <span>Canvas Engine</span>
      </header>

      <div className="w-full max-w-xl mx-auto my-auto py-6 sm:py-10 space-y-6 sm:space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-white">
            Image Compressor
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-light max-w-md mx-auto leading-relaxed px-2">
            Real-time lossless & lossy WebP optimization. Instant canvas
            rendering without server delays.
          </p>
        </div>

        {!file ? (
          <ImageDropzone onFileSelect={handleFileSelect} />
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <ImageSettingsCard
              file={file}
              originalSize={originalSize}
              quality={quality}
              setQuality={setQuality}
              format={format}
              setFormat={setFormat}
              onReset={resetAll}
              compressedSize={compressedSize}
              previewUrl={previewUrl}
              formatBytes={formatBytes}
            />

            <ImageResultCard
              fileName={file?.name}
              originalSize={originalSize}
              compressedSize={compressedSize}
              downloadUrl={compressedBlobUrl}
              format={format}
              onReset={resetAll}
              formatBytes={formatBytes}
            />
          </div>
        )}
      </div>

      <footer className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 text-[11px] sm:text-xs text-slate-500 font-light pt-4">
        <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5] text-slate-400 shrink-0" />
        <span>100% In-memory canvas • Private & ultra-fast</span>
      </footer>
    </main>
  );
}
