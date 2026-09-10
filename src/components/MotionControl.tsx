"use client";
import { useEffect, useState } from "react";
export function MotionControl() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPaused(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "paused" : "playing";
  }, [paused]);
  return (
    <button
      className="motion-control"
      type="button"
      aria-label={
        paused ? "Enable decorative motion" : "Pause decorative motion"
      }
      aria-pressed={paused}
      onClick={() => setPaused((value) => !value)}
      title={paused ? "Enable motion" : "Pause motion"}
    >
      <span className="equalizer" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="motion-label">
        {paused ? "Motion off" : "In the groove"}
      </span>
    </button>
  );
}
