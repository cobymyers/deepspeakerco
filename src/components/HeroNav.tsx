"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function HeroNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className={`hero-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="hero-nav-inner">
        <Link className="brand-badge" href="/">
          <span>DS</span>
        </Link>
        <nav className="menu">
          <Link className="menu-link active" href="/">
            Home
          </Link>
          <a className="menu-link" href="#artists">
            New Artists
          </a>
        </nav>
      </div>
    </header>
  );
}
