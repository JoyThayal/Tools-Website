"use client";
import { useState } from "react";

export default function Calculator() {
  const [value, setValue] = useState("");

  // বাটন ক্লিক করলে যা হবে
  const handleClick = (e) => {
    setValue(value + e.target.value);
  };

  // সব ক্লিয়ার করার জন্য
  const clear = () => {
    setValue("");
  };

  // হিসেব করার জন্য
  const calculate = () => {
    try {
      // eval() ফাংশন স্ট্রিংকে অংকে রূপান্তর করে হিসেব করে দেয়
      setValue(eval(value).toString());
    } catch (error) {
      setValue("Error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* ডিসপ্লে স্ক্রিন */}
        <input
          type="text"
          value={value}
          readOnly
          className="w-full mb-4 p-4 text-2xl text-right border rounded bg-gray-50"
        />

        {/* বাটন গ্রিড */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={clear}
            className="col-span-2 p-4 bg-red-400 text-white rounded"
          >
            AC
          </button>
          <button
            onClick={() => setValue(value.slice(0, -1))}
            className="p-4 bg-yellow-400 text-white rounded"
          >
            DE
          </button>
          <button
            value="/"
            onClick={handleClick}
            className="p-4 bg-blue-500 text-white rounded"
          >
            /
          </button>

          {[7, 8, 9, "*", 4, 5, 6, "-", 1, 2, 3, "+", 0, "."].map((item) => (
            <button
              key={item}
              value={item}
              onClick={handleClick}
              className="p-4 bg-gray-200 rounded hover:bg-gray-300"
            >
              {item}
            </button>
          ))}

          <button
            onClick={calculate}
            className="col-span-2 p-4 bg-green-500 text-white rounded"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}
