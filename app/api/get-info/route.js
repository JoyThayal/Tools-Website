import { NextResponse } from "next/server";
import { create } from "yt-dlp-exec";
import path from "path";
import fs from "fs";

// OS অনুযায়ী সঠিক পাথ চেনা
const isWindows = process.platform === "win32";
const binaryFileName = isWindows ? "yt-dlp.exe" : "yt-dlp";
const binaryPath = path.join(process.cwd(), "bin", binaryFileName);

// যদি bin ফোল্ডারে ফাইল থাকে তবে সেটা নেবে, না হলে গ্লোবাল রানার
const customYtDlp = fs.existsSync(binaryPath)
  ? create(binaryPath)
  : create("yt-dlp");

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

    const formatsMap = new Map();

    if (info.formats && Array.isArray(info.formats)) {
      info.formats.forEach((f) => {
        if (f.height && f.ext === "mp4") {
          const resolution = `${f.height}p`;
          const size = f.filesize || f.filesize_approx;

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

    const audioFormats = info.formats?.filter(
      (f) => f.vcodec === "none" && (f.filesize || f.filesize_approx),
    );
    const bestAudio = audioFormats?.[audioFormats.length - 1];

    const qualities = Array.from(formatsMap.values()).sort(
      (a, b) => parseInt(b.quality) - parseInt(a.quality),
    );

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
      qualities,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch video qualities or details" },
      { status: 500 },
    );
  }
}
