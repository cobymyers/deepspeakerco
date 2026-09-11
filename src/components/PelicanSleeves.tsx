"use client";
import { useState } from "react";
import Image from "next/image";
const sleeves = [
  { name: "Golden hour", file: "gold", color: "#d3a758" },
  { name: "Blue note", file: "blue", color: "#92b0cf" },
  { name: "After hours", file: "olive", color: "#595447" },
];
export function PelicanSleeves() {
  const [selected, setSelected] = useState(0);
  return (
    <section
      className="pelican-section section"
      aria-labelledby="pelican-title"
    >
      <div className="pelican-copy">
        <p className="eyebrow">An original, on repeat.</p>
        <h2 id="pelican-title">
          Same bird.
          <br />
          New discoveries.
        </h2>
        <p>A familiar face for wherever the music takes us next.</p>
        <div
          className="sleeve-controls"
          role="group"
          aria-label="Choose a pelican sleeve"
        >
          {sleeves.map((sleeve, index) => (
            <button
              key={sleeve.file}
              type="button"
              aria-pressed={selected === index}
              aria-label={`Show ${sleeve.name} sleeve`}
              onClick={() => setSelected(index)}
            >
              <span style={{ backgroundColor: sleeve.color }} />
              {sleeve.name}
            </button>
          ))}
        </div>
        <p className="sleeve-caption" aria-live="polite">
          {String(selected + 1).padStart(2, "0")} / 03 —{" "}
          {sleeves[selected].name}
        </p>
      </div>
      <div className="sleeve-stack">
        {sleeves.map((sleeve, index) => (
          <div
            key={sleeve.file}
            className={`pelican-sleeve ${selected === index ? "selected" : ""}`}
            style={
              {
                "--sleeve-position": (index - selected + 3) % 3,
              } as React.CSSProperties
            }
            aria-hidden={selected !== index}
          >
            <Image
              src={`/brand/pelican-${sleeve.file}.webp`}
              alt={`Original Deep Speaker pelican and DS artwork, ${sleeve.name} edition`}
              width={750}
              height={750}
              sizes="(max-width: 640px) 260px, 320px"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
