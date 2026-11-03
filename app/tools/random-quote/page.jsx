"use client";

import { useState } from "react";

export default function RandomQuoteGenerator() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const quote = [
    { text: "I am a App Developer", author: "Aman" },
    { text: "I am a Web Developer", author: "Joy" },
    { text: "I am a Game Developer", author: "Bijoy" },
    { text: "I am a Hardware Repaier", author: "Biprajit" },
  ];
  const [quoteText, setQuoteText] = useState(quote[0]);

  const randomQuote = () => {
    let newIndex;

    do {
      newIndex = Math.floor(Math.random() * quote.length);
    } while (newIndex === currentIndex); // আগের ইনডেক্সের সাথে মিললে আবার লুপ চলবে

    setQuoteText(quote[newIndex]); // টেক্সট সেট হলো
    setCurrentIndex(newIndex); // এবার ইনডেক্সটা মনে রাখা হলো পরের বারের জন্য
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center gap-5">
      <h1 className="text-5xl">{quoteText?.text}</h1>
      <p className="text-3xl">{quoteText?.author}</p>
      <button
        onClick={() => {
          randomQuote();
        }}
        className="bg-blue-600 px-5 py-3 rounded hover:bg-blue-800 transition"
      >
        New Quote
      </button>
    </div>
  );
}
