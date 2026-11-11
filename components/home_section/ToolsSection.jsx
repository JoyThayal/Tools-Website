import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { toolsData } from "@/components/home_section/toolsData";

export default function ToolsSection() {
  return (
    <main className="min-h-dvh bg-[#0d1117] text-slate-100 flex flex-col justify-between p-6 sm:p-10 md:p-14 font-sans antialiased">
      {/* হেডার */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800/60">
        <h1 className="text-sm font-medium tracking-widest uppercase text-slate-300">
          Grow Tech Studio
        </h1>
        <span className="text-xs text-slate-500 font-mono">
          {toolsData.length} Tools Available
        </span>
      </header>

      {/* গ্রিড এবং কার্ড */}
      <div className="w-full max-w-7xl mx-auto my-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {toolsData.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative flex flex-col rounded-3xl bg-slate-900/30 border border-slate-800/60 hover:border-slate-700/80 overflow-hidden transition-all duration-300 shadow-xl shadow-black/20"
            >
              {/* কার্ড ইমেজ */}
              <div className="relative w-full h-48 sm:h-56 bg-slate-800/50 overflow-hidden">
                <Image
                  src={tool.image}
                  alt={tool.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* কার্ড ইনফো ও অ্যাকশন বাটন */}
              <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-medium text-white group-hover:text-sky-300 transition-colors">
                    {tool.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">{tool.desc}</p>
                </div>

                <div className="w-9 h-9 rounded-2xl bg-slate-800/80 group-hover:bg-white group-hover:text-slate-950 flex items-center justify-center shrink-0 transition-colors">
                  <ArrowUpRight className="w-4 h-4 stroke-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ফুটার */}
      <footer className="w-full max-w-7xl mx-auto pt-6 border-t border-slate-800/60 text-center text-xs text-slate-600">
        Grow Tech • Fast, client-side & zero tracking
      </footer>
    </main>
  );
}
