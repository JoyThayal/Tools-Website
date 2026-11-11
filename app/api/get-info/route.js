import { NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";
import util from "util";

const execFilePromise = util.promisify(execFile);

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "Adaptive Size";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function getYouTubeId(url) {
  const match = url?.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  );
  return match ? match[1] : null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const url = body?.url?.trim();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // ১. লোকালহোস্টে সরাসরি yt-dlp বাইনারি দিয়ে মেটাডেটা নেওয়া
    const isWindows = process.platform === "win32";
    const binaryFileName = isWindows ? "yt-dlp.exe" : "yt-dlp";
    const localBinary = path.join(process.cwd(), "bin", binaryFileName);

    if (fs.existsSync(localBinary)) {
      try {
        const { stdout } = await execFilePromise(localBinary, [
          "-J",
          "--no-warnings",
          "--no-check-certificates",
          url,
        ]);

        const info = JSON.parse(stdout);
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

        const qualities = Array.from(formatsMap.values()).sort(
          (a, b) => parseInt(b.quality) - parseInt(a.quality),
        );

        // অডিও অপশন যোগ
        qualities.push({
          formatId: "bestaudio",
          quality: "Audio Only (MP3)",
          ext: "mp3",
          type: "audio",
          sizeText: "High Bitrate",
        });

        return NextResponse.json({
          title: info.title || "Extracted Video",
          thumbnail: info.thumbnail || "",
          qualities,
        });
      } catch (localErr) {
        console.error(
          "Local yt-dlp execution failed, switching to safe mode:",
          localErr,
        );
      }
    }

    // ২. ফলব্যাক মোড (যাতে Vercel বা অন্য কোথাও ক্র্যাশ না করে)
    const ytId = getYouTubeId(url);
    if (ytId) {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`,
      );

      let title = "YouTube Video";
      let thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

      if (oembedRes.ok) {
        const meta = await oembedRes.json();
        title = meta.title || title;
        thumbnail = meta.thumbnail_url || thumbnail;
      }

      return NextResponse.json({
        title,
        thumbnail,
        qualities: [
          {
            formatId: "best",
            quality: "Best Available (HD)",
            ext: "mp4",
            type: "video",
            sizeText: "Auto Stream",
          },
          {
            formatId: "audio",
            quality: "Audio Extract (MP3)",
            ext: "mp3",
            type: "audio",
            sizeText: "320 kbps",
          },
        ],
      });
    }

    return NextResponse.json(
      { error: "Could not extract information from this link." },
      { status: 400 },
    );
  } catch (error) {
    console.error("General API Error:", error);
    return NextResponse.json(
      { error: "Server encountered an issue processing the URL." },
      { status: 500 },
    );
  }
}
