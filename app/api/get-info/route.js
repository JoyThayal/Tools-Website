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

    // ১. লোকালহোস্টে yt-dlp বাইনারি থাকলে অগ্রাধিকার দেবে
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
          "Local yt-dlp failed, switching to web extractor:",
          localErr,
        );
      }
    }

    // ২. Vercel-এর জন্য ফুল স্ট্রিমিং মেটাডেটা এক্সট্র্যাক্টর (YouTube Player API)
    const ytId = getYouTubeId(url);
    if (ytId) {
      // ইউটিউব অফিসিয়াল প্লেয়ার API রিকোয়েস্ট (কোনো বাইনারি ছাড়া)
      const ytResponse = await fetch(
        "https://www.youtube.com/youtubei/v1/player",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          body: JSON.stringify({
            videoId: ytId,
            context: {
              client: {
                clientName: "ANDROID",
                clientVersion: "19.09.37",
                androidSdkVersion: 30,
              },
            },
          }),
        },
      );

      const playerInfo = await ytResponse.json();
      const streamingData = playerInfo?.streamingData;

      if (streamingData) {
        const allStreams = [
          ...(streamingData.formats || []),
          ...(streamingData.adaptiveFormats || []),
        ];

        const formatsMap = new Map();

        allStreams.forEach((f) => {
          if (f.qualityLabel && f.mimeType?.includes("video/mp4")) {
            const resolution = f.qualityLabel.split(" ")[0]; // যেমন: 1080p, 720p
            const size = f.contentLength ? parseInt(f.contentLength) : null;

            if (!formatsMap.has(resolution)) {
              formatsMap.set(resolution, {
                formatId: f.itag?.toString() || resolution,
                quality: resolution,
                ext: "mp4",
                type: "video",
                sizeText: formatBytes(size),
              });
            }
          }
        });

        const qualities = Array.from(formatsMap.values()).sort(
          (a, b) => parseInt(b.quality) - parseInt(a.quality),
        );

        // অডিও ফরম্যাট খোঁজা
        const audioStream = allStreams.find((f) =>
          f.mimeType?.includes("audio/mp4"),
        );
        qualities.push({
          formatId: audioStream?.itag?.toString() || "audio",
          quality: "Audio Only (MP3)",
          ext: "mp3",
          type: "audio",
          sizeText: formatBytes(
            audioStream?.contentLength
              ? parseInt(audioStream.contentLength)
              : null,
          ),
        });

        return NextResponse.json({
          title: playerInfo.videoDetails?.title || "YouTube Video",
          thumbnail:
            playerInfo.videoDetails?.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
            `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
          qualities: qualities.length > 1 ? qualities : getDefaultQualities(),
        });
      }
    }

    // ফলব্যাক
    return NextResponse.json({
      title: "Extracted Video",
      thumbnail: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "",
      qualities: getDefaultQualities(),
    });
  } catch (error) {
    console.error("General API Error:", error);
    return NextResponse.json(
      { error: "Server encountered an issue processing the URL." },
      { status: 500 },
    );
  }
}

function getDefaultQualities() {
  return [
    {
      formatId: "1080p",
      quality: "1080p",
      ext: "mp4",
      type: "video",
      sizeText: "Full HD",
    },
    {
      formatId: "720p",
      quality: "720p",
      ext: "mp4",
      type: "video",
      sizeText: "HD",
    },
    {
      formatId: "480p",
      quality: "480p",
      ext: "mp4",
      type: "video",
      sizeText: "Standard",
    },
    {
      formatId: "audio",
      quality: "Audio Only (MP3)",
      ext: "mp3",
      type: "audio",
      sizeText: "320 kbps",
    },
  ];
}
