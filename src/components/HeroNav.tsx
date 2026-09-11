"use client";
import { MotionControl } from "@/components/MotionControl";
import { PelicanMark } from "@/components/PelicanMark";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function HeroNav() {
  const pathname = usePathname();
  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Link className="wordmark" href="/" aria-label="Deep Speaker home">
          <PelicanMark />
          <span className="brand-name">deep speaker.</span>
        </Link>
        <div className="nav-actions">
          <MotionControl />
          <nav aria-label="Main navigation">
            <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
              Discover
            </Link>
            <Link
              href="/archive"
              aria-current={pathname === "/archive" ? "page" : undefined}
            >
              Archive
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
