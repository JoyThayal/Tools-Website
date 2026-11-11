import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");
  const formatId = searchParams.get("formatId") || "best";
  const type = searchParams.get("type") || "video";

  if (!videoUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // ১. লোকালহোস্টে yt-dlp বাইনারি থাকলে সরাসরি লোকাল ইঞ্জিন ব্যবহার করবে
  const isWindows = process.platform === "win32";
  const binaryFileName = isWindows ? "yt-dlp.exe" : "yt-dlp";
  const localBinary = path.join(process.cwd(), "bin", binaryFileName);

  if (fs.existsSync(localBinary)) {
    const args = [
      "-f",
      type === "audio" ? "bestaudio" : `${formatId}+bestaudio/best`,
      "-o",
      "-",
      videoUrl,
    ];

    const ytDlpProcess = spawn(localBinary, args);

    const stream = new ReadableStream({
      start(controller) {
        ytDlpProcess.stdout.on("data", (chunk) => controller.enqueue(chunk));
        ytDlpProcess.stdout.on("end", () => controller.close());
        ytDlpProcess.stderr.on("data", (data) =>
          console.error(data.toString()),
        );
        ytDlpProcess.on("error", (err) => controller.error(err));
      },
      cancel() {
        ytDlpProcess.kill();
      },
    });

    const extension = type === "audio" ? "mp3" : "mp4";

    return new NextResponse(stream, {
      headers: {
        "Content-Disposition": `attachment; filename="download-${Date.now()}.${extension}"`,
        "Content-Type": type === "audio" ? "audio/mpeg" : "video/mp4",
      },
    });
  }

  // ২. Vercel ক্লাউড মোড: সরাসরি ডিরেক্ট মিডিয়া স্ট্রিমে ব্রাউজার রিডাইরেক্ট
  try {
    const match = videoUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
    );
    const ytId = match ? match[1] : null;

    if (!ytId) {
      return NextResponse.json(
        { error: "Invalid video link" },
        { status: 400 },
      );
    }

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
    const allFormats = [
      ...(streamingData?.formats || []),
      ...(streamingData?.adaptiveFormats || []),
    ];

    // রিকোয়েস্ট করা itag বা সেরা প্রোগ্রেসিভ ভিডিও/অডিও স্ট্রিম খোঁজা
    let targetFormat = allFormats.find((f) => f.itag?.toString() === formatId);

    if (!targetFormat) {
      if (type === "audio") {
        targetFormat = allFormats.find(
          (f) => f.mimeType?.includes("audio/mp4") && f.url,
        );
      } else {
        // ভিডিওর ক্ষেত্রে সরাসরি অডিও সহ প্রোগ্রেসিভ ফরম্যাট আগে খোঁজা
        targetFormat =
          streamingData?.formats?.find((f) => f.url) ||
          allFormats.find((f) => f.url && f.mimeType?.includes("video/mp4"));
      }
    }

    if (targetFormat?.url) {
      return NextResponse.redirect(targetFormat.url);
    }

    return NextResponse.json(
      { error: "Direct stream link could not be generated." },
      { status: 404 },
    );
  } catch (error) {
    console.error("Vercel download error:", error);
    return NextResponse.json(
      { error: "Failed to process download stream." },
      { status: 500 },
    );
  }
}
