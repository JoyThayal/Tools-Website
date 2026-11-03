import Link from "next/link";
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <Link href="/tools/video-to-mp3" className="text-indigo-400 underline">
        ভিডিও টু MP3 পেজে যান 👉
      </Link>
    </div>
  );
}
