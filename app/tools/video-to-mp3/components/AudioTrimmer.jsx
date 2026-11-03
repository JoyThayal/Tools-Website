"use client";

import { useState, useRef, useEffect } from "react";
import { Scissors, Play, Pause, Download, Loader2 } from "lucide-react";

export default function AudioTrimmer({ audioUrl, fileName, ffmpegRef }) {
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimming, setTrimming] = useState(false);
  const [trimmedUrl, setTrimmedUrl] = useState(null);

  const audioRef = useRef(null);

  // অডিওর সঠিক মোট সময় বের করা
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onloadedmetadata = () => {
        const d = Number(audio.duration.toFixed(2)) || 60;
        setDuration(d);
        setStartTime(0);
        setEndTime(Math.min(30, d));
      };
    }
  }, [audioUrl]);

  // মিলি-সেকেন্ড সহ সময় ফরম্যাট (MM:SS.s)
  const formatTime = (secs) => {
    const safeSecs = Math.max(0, isNaN(secs) ? 0 : secs);
    const m = Math.floor(safeSecs / 60);
    const s = Math.floor(safeSecs % 60);
    const ms = Math.floor((safeSecs % 1) * 10);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
  };

  // ইনপুট হ্যান্ডলার - Start Time সরাসরি লিখলে
  const handleStartInputChange = (val) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const clamped = Math.max(0, Math.min(num, endTime - 0.2));
      setStartTime(Number(clamped.toFixed(2)));
    } else if (val === "") {
      setStartTime(0);
    }
  };

  // End Input পরিবর্তন হ্যান্ডলার
  const handleEndInputChange = (val) => {
    if (val === "") {
      setEndTime(""); // ব্যাকস্পেস দিলে যাতে বক্সটি সম্পূর্ণ ফাঁকা হতে পারে
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setEndTime(num);
    }
  };

  // বক্সের বাইরে ক্লিক করলে (onBlur) কমপক্ষে start-এর ১ সেকেন্ড পরে লক হবে
  const handleEndInputBlur = () => {
    const currentEnd =
      typeof endTime === "number" ? endTime : parseFloat(endTime);
    const minEnd = Number((startTime + 1).toFixed(2));
    const maxEnd = duration || 60;

    if (isNaN(currentEnd) || currentEnd < minEnd) {
      setEndTime(Math.min(minEnd, maxEnd));
    } else if (currentEnd > maxEnd) {
      setEndTime(maxEnd);
    } else {
      setEndTime(Number(currentEnd.toFixed(2)));
    }
  };

  // সিলেক্ট করা অংশটুকু প্লে করা
  const handlePreview = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // অডিও চলতে চলতে endTime এ পৌঁছালে পজ হওয়া
  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.currentTime >= endTime) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // FFmpeg দিয়ে ট্রিম করা
  const handleTrimAndExport = async () => {
    if (!ffmpegRef.current) return;
    setTrimming(true);

    try {
      const { fetchFile } = await import("@ffmpeg/util");
      const ffmpeg = ffmpegRef.current;

      const fileData = await fetchFile(audioUrl);
      await ffmpeg.writeFile("to_cut.mp3", fileData);

      // নিখুঁত কাটার জন্য কপি মোড
      await ffmpeg.exec([
        "-i",
        "to_cut.mp3",
        "-ss",
        startTime.toFixed(2),
        "-to",
        endTime.toFixed(2),
        "-c",
        "copy",
        "cut_final.mp3",
      ]);

      const data = await ffmpeg.readFile("cut_final.mp3");
      const blob = new Blob([data.buffer], { type: "audio/mp3" });
      setTrimmedUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    } finally {
      setTrimming(false);
    }
  };

  return (
    <div className="mt-3.5 sm:mt-4 pt-3 border-t border-slate-800/80">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-2.5 px-3 bg-slate-800/60 hover:bg-slate-800 active:scale-[0.99] text-indigo-400 hover:text-indigo-300 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition select-none cursor-pointer"
        >
          <Scissors className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Trim this Audio (Optional)</span>
        </button>
      ) : (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-3.5">
          {/* Top Header */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-indigo-400" />
              Trim by Slider or Typing
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[11px] sm:text-xs text-slate-500 hover:text-slate-300 cursor-pointer p-1"
            >
              Cancel
            </button>
          </div>

          {/* Time Display Badge */}
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/70 rounded-lg p-2 text-[10px] sm:text-xs font-mono text-slate-400">
            <div>
              Start:{" "}
              <b className="text-indigo-400 font-bold">
                {formatTime(startTime)}
              </b>
            </div>
            <div className="text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold">
              Length: {(endTime - startTime).toFixed(1)}s
            </div>
            <div>
              End:{" "}
              <b className="text-indigo-400 font-bold">{formatTime(endTime)}</b>
            </div>
          </div>

          {/* Start Point Slider & Editable Box */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Start Position</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500">Edit (sec):</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max={(duration || 60).toString()}
                  value={startTime === 0 ? "" : startTime}
                  placeholder="0"
                  onChange={(e) => handleStartInputChange(e.target.value)}
                  className="w-16 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded px-1.5 py-0.5 text-right font-mono text-xs text-indigo-300 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <div className="h-6 flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 60}
                step="0.05"
                value={typeof startTime === "number" ? startTime : 0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const currentEnd =
                    typeof endTime === "number" ? endTime : duration || 60;
                  if (val <= currentEnd - 1)
                    setStartTime(Number(val.toFixed(2)));
                }}
                className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer touch-pan-x"
              />
            </div>
          </div>

          {/* End Point Slider & Editable Box */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">End Position</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500">Edit (sec):</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max={(duration || 60).toString()}
                  value={endTime}
                  placeholder={(startTime + 1).toFixed(1)}
                  onChange={(e) => handleEndInputChange(e.target.value)}
                  onBlur={handleEndInputBlur}
                  className="w-16 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded px-1.5 py-0.5 text-right font-mono text-xs text-indigo-300 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <div className="h-6 flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 60}
                step="0.05"
                value={typeof endTime === "number" ? endTime : startTime + 1}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val >= startTime + 1) setEndTime(Number(val.toFixed(2)));
                }}
                className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer touch-pan-x"
              />
            </div>
          </div>

          {/* Preview & Cut Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <button
              onClick={handlePreview}
              className="w-full sm:flex-1 py-2 sm:py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer select-none"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{isPlaying ? "Pause Preview" : "Play Selection"}</span>
            </button>

            <button
              onClick={handleTrimAndExport}
              disabled={trimming}
              className="w-full sm:flex-1 py-2 sm:py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer select-none"
            >
              {trimming ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Scissors className="w-3.5 h-3.5" />
              )}
              <span>{trimming ? "Trimming..." : "Cut Segment"}</span>
            </button>
          </div>

          {/* Download Final Output */}
          {trimmedUrl && (
            <div className="pt-2.5 border-t border-slate-800/80">
              <a
                href={trimmedUrl}
                download={`trimmed_${fileName ? fileName.replace(/\.[^/.]+$/, "") : "audio"}.mp3`}
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold py-2 sm:py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Trimmed MP3</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
