export default function Button(text, className) {
  return (
    <button
      className={`p-4 border text-2xl rounded ${className}`}
      onClick={() => onclick(text)}
    >
      {text}
    </button>
  );
}
