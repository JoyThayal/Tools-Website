"use client";

import { useEffect, useState } from "react";

export default function DigitalClockPage() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="h-screen w-full bg-blue-950 flex justify-center items-center">
      <h1 className="text-blue-500 text-8xl font-bold drop-shadow-2xl tracking-tighter">
        {time}
      </h1>
    </div>
  );
}
