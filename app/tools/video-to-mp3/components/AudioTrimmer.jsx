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

  // ইনপুট বক্সের টেক্সট স্টেট (MM:SS হিসেবে রাখার জন্য)
  const [startInputText, setStartInputText] = useState("00:00");
  const [endInputText, setEndInputText] = useState("00:30");

  const audioRef = useRef(null);

  // সেকেন্ড থেকে MM:SS ফরম্যাটে রূপান্তর
  const formatToTimeStr = (secs) => {
    const safeSecs = Math.max(0, isNaN(secs) ? 0 : secs);
    const m = Math.floor(safeSecs / 60);
    const s = Math.floor(safeSecs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // MM:SS বা সাধারণ নাম্বার থেকে সেকেন্ডে রূপান্তর
  const parseTimeToSeconds = (str) => {
    if (!str || typeof str !== "string") return 0;
    const cleanStr = str.trim();
    if (cleanStr.includes(":")) {
      const parts = cleanStr.split(":");
      const mins = parseFloat(parts[0]) || 0;
      const secs = parseFloat(parts[1]) || 0;
      return mins * 60 + secs;
    }
    return parseFloat(cleanStr) || 0;
  };

  // অডিও লোড হলে মোট সময় সেট করা
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onloadedmetadata = () => {
        const d = Number(audio.duration.toFixed(2)) || 60;
        const initialEnd = Math.min(30, d);
        setDuration(d);
        setStartTime(0);
        setEndTime(initialEnd);
        setStartInputText("00:00");
        setEndInputText(formatToTimeStr(initialEnd));
      };
    }
  }, [audioUrl]);

  // স্লাইডার নাড়ালে ইনপুট বক্সের লেখা আপডেট করা
  const updateStartTimeFromSlider = (val) => {
    setStartTime(val);
    setStartInputText(formatToTimeStr(val));
  };

  const updateEndTimeFromSlider = (val) => {
    setEndTime(val);
    setEndInputText(formatToTimeStr(val));
  };

  // Start Input ফোকাস হারালে (onBlur) ভ্যালিডেশন
  const handleStartBlur = () => {
    const parsedSecs = parseTimeToSeconds(startInputText);
    const maxAllowed = Math.max(0, endTime - 1);
    const safeSecs = Math.min(Math.max(0, parsedSecs), maxAllowed);

    setStartTime(safeSecs);
    setStartInputText(formatToTimeStr(safeSecs));
  };

  // End Input ফোকাস হারালে (onBlur) ভ্যালিডেশন
  const handleEndBlur = () => {
    const parsedSecs = parseTimeToSeconds(endInputText);
    const minAllowed = startTime + 1;
    const maxDuration = duration || 60;
    let safeSecs = Math.max(minAllowed, parsedSecs);
    if (safeSecs > maxDuration) safeSecs = maxDuration;

    setEndTime(safeSecs);
    setEndInputText(formatToTimeStr(safeSecs));
  };

  // অডিও প্রিভিউ প্লে করা
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

  const currentLength = Math.max(0, endTime - startTime).toFixed(1);

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
          {/* Header */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-indigo-400" />
              Trim Audio (MM:SS)
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[11px] sm:text-xs text-slate-500 hover:text-slate-300 cursor-pointer p-1"
            >
              Cancel
            </button>
          </div>

          {/* MM:SS Time Inputs Badge */}
          <div className="grid grid-cols-3 items-center bg-slate-900/80 border border-slate-800/80 rounded-xl p-2 gap-2 text-center">
            {/* Start Field */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-medium mb-1">
                Start
              </span>
              <input
                type="text"
                value={startInputText}
                placeholder="00:00"
                onChange={(e) => setStartInputText(e.target.value)}
                onBlur={handleStartBlur}
                className="w-18 bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-lg px-2 py-1 text-center font-mono text-xs sm:text-sm font-bold text-indigo-400 outline-none transition shadow-inner"
              />
            </div>

            {/* Total Length */}
            <div className="flex flex-col items-center justify-center border-x border-slate-800/80 px-1">
              <span className="text-[10px] text-slate-400 font-medium mb-1">
                Length
              </span>
              <div className="text-slate-200 font-mono text-xs sm:text-sm font-semibold bg-slate-800/80 px-2.5 py-1 rounded-lg">
                {currentLength}s
              </div>
            </div>

            {/* End Field */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-medium mb-1">
                End
              </span>
              <input
                type="text"
                value={endInputText}
                placeholder="00:30"
                onChange={(e) => setEndInputText(e.target.value)}
                onBlur={handleEndBlur}
                className="w-18 bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-lg px-2 py-1 text-center font-mono text-xs sm:text-sm font-bold text-indigo-400 outline-none transition shadow-inner"
              />
            </div>
          </div>

          {/* Sliders Container */}
          <div className="space-y-3 bg-slate-900/40 border border-slate-800/50 rounded-xl p-3">
            {/* Start Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1">
                <span>Start Point</span>
                <span className="font-mono text-indigo-400">
                  {formatToTimeStr(startTime)}
                </span>
              </div>
              <div className="h-5 flex items-center">
                <input
                  type="range"
                  min="0"
                  max={duration || 60}
                  step="0.05"
                  value={startTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val <= endTime - 1) {
                      updateStartTimeFromSlider(Number(val.toFixed(2)));
                    }
                  }}
                  className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer touch-pan-x"
                />
              </div>
            </div>

            {/* End Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1">
                <span>End Point</span>
                <span className="font-mono text-indigo-400">
                  {formatToTimeStr(endTime)}
                </span>
              </div>
              <div className="h-5 flex items-center">
                <input
                  type="range"
                  min="0"
                  max={duration || 60}
                  step="0.05"
                  value={endTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val >= startTime + 1) {
                      updateEndTimeFromSlider(Number(val.toFixed(2)));
                    }
                  }}
                  className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer touch-pan-x"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              <span>{isPlaying ? "Pause Preview" : "Play Preview"}</span>
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

          {/* Download Output */}
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
