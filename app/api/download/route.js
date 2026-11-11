import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");
  const formatId = searchParams.get("formatId") || "best";
  const type = searchParams.get("type") || "video";

  if (!videoUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const binaryPath = path.join(process.cwd(), "bin", "yt-dlp.exe");

  // অডিও এবং ভিডিও ফরম্যাট আর্গুমেন্ট হ্যান্ডেল করা
  const args = [
    "-f",
    type === "audio" ? "bestaudio" : `${formatId}+bestaudio/best`,
    "-o",
    "-",
    videoUrl,
  ];

  const ytDlpProcess = spawn(binaryPath, args);

  const stream = new ReadableStream({
    start(controller) {
      ytDlpProcess.stdout.on("data", (chunk) => controller.enqueue(chunk));
      ytDlpProcess.stdout.on("end", () => controller.close());
      ytDlpProcess.stderr.on("data", (data) => console.error(data.toString()));
      ytDlpProcess.on("error", (err) => controller.error(err));
    },
    cancel() {
      ytDlpProcess.kill();
    },
  });

  const extension = type === "audio" ? "mp3" : "mp4";

  return new NextResponse(stream, {
    headers: {
      "Content-Disposition": `attachment; filename="video-${Date.now()}.${extension}"`,
      "Content-Type": type === "audio" ? "audio/mpeg" : "video/mp4",
    },
  });
}
