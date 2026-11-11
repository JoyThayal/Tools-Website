import { NextResponse } from "next/server";
import { create } from "yt-dlp-exec";
import path from "path";

const binaryPath = path.join(process.cwd(), "bin", "yt-dlp.exe");
const customYtDlp = create(binaryPath);

// বাইট থেকে MB-তে কনভার্ট করার ফাংশন
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "Unknown size";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const info = await customYtDlp(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
    });

    // সব কোয়ালিটি ফিল্টার করা
    const formatsMap = new Map();

    if (info.formats && Array.isArray(info.formats)) {
      info.formats.forEach((f) => {
        // শুধু ভিডিও ফাইল (যেগুলোর হাইট আছে)
        if (f.height && f.ext === "mp4") {
          const resolution = `${f.height}p`;
          const size = f.filesize || f.filesize_approx;

          // ডুপ্লিকেট বাদ দিয়ে সেরা ফরম্যাটটি রাখা
          if (
            !formatsMap.has(resolution) ||
            (size && !formatsMap.get(resolution).filesize)
          ) {
            formatsMap.set(resolution, {
              formatId: f.format_id,
              quality: resolution,
              ext: "mp4",
              type: "video",
              sizeText: formatBytes(size),
            });
          }
        }
      });
    }

    // একটি অডিও (MP3/M4A) অপশন যোগ করা
    const audioFormats = info.formats?.filter(
      (f) => f.vcodec === "none" && (f.filesize || f.filesize_approx),
    );
    const bestAudio = audioFormats?.[audioFormats.length - 1];

    const qualities = Array.from(formatsMap.values()).sort((a, b) => {
      return parseInt(b.quality) - parseInt(a.quality);
    });

    if (bestAudio) {
      qualities.push({
        formatId: bestAudio.format_id,
        quality: "Audio Only (MP3)",
        ext: "mp3",
        type: "audio",
        sizeText: formatBytes(bestAudio.filesize || bestAudio.filesize_approx),
      });
    }

    return NextResponse.json({
      title: info.title || "Untitled Video",
      thumbnail: info.thumbnail || "",
      qualities: qualities,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch video qualities or details" },
      { status: 500 },
    );
  }
}
