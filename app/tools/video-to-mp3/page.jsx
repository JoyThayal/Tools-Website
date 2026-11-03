"use client";

import { useState, useRef } from "react";
import {
  Sparkles,
  Music,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import Dropzone from "./components/Dropzone";
import FileCard from "./components/FileCard";
import ResultCard from "./components/ResultCard";

export const dynamic = "force-dynamic";

export default function VideoToMp3Page() {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  // শুরুতে null থাকবে যাতে Node.js সার্ভার বিল্ডের সময় ক্র্যাশ না করে
  const ffmpegRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setAudioUrl(null);
      setProgress(0);
      setStatusText("Ready to convert! Click the button below.");
    } else {
      setStatusText("Please select a valid video file.");
    }
  };

  const resetAll = () => {
    setVideoFile(null);
    setAudioUrl(null);
    setProgress(0);
    setStatusText("");
  };

  const loadFFmpeg = async () => {
    // শুধু ব্রাউজারেই ডাইনামিকালি লাইব্রেরি লোড হবে
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");

    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }

    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("progress", ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    setStatusText("Initializing engine...");
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });
    setLoaded(true);
  };

  const convertToMp3 = async () => {
    if (!videoFile) return;

    setLoading(true);
    setProgress(0);
    setStatusText("Starting conversion...");

    try {
      if (!loaded || !ffmpegRef.current) {
        await loadFFmpeg();
      }

      const { fetchFile } = await import("@ffmpeg/util");
      const ffmpeg = ffmpegRef.current;

      setStatusText("Processing media file...");
      const fileData = await fetchFile(videoFile);
      await ffmpeg.writeFile("input_video", fileData);

      setStatusText("Extracting audio (192kbps MP3)...");
      await ffmpeg.exec([
        "-i",
        "input_video",
        "-vn",
        "-b:a",
        "192k",
        "output.mp3",
      ]);

      const data = await ffmpeg.readFile("output.mp3");
      const audioBlob = new Blob([data.buffer], { type: "audio/mp3" });
      setAudioUrl(URL.createObjectURL(audioBlob));
      setStatusText("Conversion complete!");
    } catch (error) {
      console.error(error);
      setStatusText("An error occurred during conversion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-dvh bg-[#0B0F19] text-slate-100 flex items-center justify-center p-3.5 sm:p-6 md:p-8 overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-125 sm:h-125 bg-indigo-600/15 rounded-full blur-[90px] sm:blur-[130px] pointer-events-none" />
      <div className="absolute bottom-5 right-5 w-48 h-48 sm:w-75 sm:h-75 bg-emerald-600/10 rounded-full blur-[80px] sm:blur-[110px] pointer-events-none" />

      <div className="relative w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl my-auto">
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Fast Client-Side Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-linear-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Video to MP3
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 sm:mt-2 max-w-sm sm:max-w-md px-2">
            Convert videos directly in your browser. Fast, private, and
            serverless.
          </p>
        </div>

        {!videoFile ? (
          <Dropzone onFileSelect={handleFileSelect} />
        ) : (
          <FileCard file={videoFile} onRemove={resetAll} disabled={loading} />
        )}

        {videoFile && !audioUrl && (
          <button
            onClick={convertToMp3}
            disabled={loading}
            className="w-full mt-4 sm:mt-6 bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:from-indigo-700 active:to-indigo-600 disabled:opacity-50 text-white font-semibold py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Music className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Convert to MP3</span>
              </>
            )}
          </button>
        )}

        {loading && (
          <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2">
            <div className="flex justify-between items-center text-[11px] sm:text-xs text-slate-400 font-mono">
              <span className="truncate pr-2">{statusText}</span>
              <span className="text-indigo-400 font-semibold shrink-0">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 sm:h-2 overflow-hidden border border-slate-700/50">
              <div
                className="bg-linear-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {audioUrl && (
          <ResultCard
            audioUrl={audioUrl}
            fileName={videoFile?.name}
            onReset={resetAll}
          />
        )}

        {statusText && !loading && !audioUrl && (
          <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400 justify-center text-center px-2">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>{statusText}</span>
          </div>
        )}

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-800/80 flex items-center justify-center gap-1.5 sm:gap-2 text-slate-500 text-[11px] sm:text-xs text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Files stay on your device • 100% Private</span>
        </div>
      </div>
    </main>
  );
}
