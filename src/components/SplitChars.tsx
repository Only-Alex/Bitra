/** Per-character spans for staggered type choreography. */
export function SplitChars({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((c, i) => (
        <span key={i} className="char">
          {c === " " ? " " : c}
        </span>
      ))}
    </>
  );
}
