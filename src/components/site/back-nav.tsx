import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Destination = { href: string; label: string };

/**
 * The way out of a page, at the end of it.
 *
 * Every page needs one that does not rely on the browser's back button. A visitor who
 * arrived by scanning a QR code at the temple has no history to go back to — the archive
 * page is the first thing in their tab, and without a link forward they are stuck on it.
 *
 * Placed at the end rather than the top because these pages are read through: someone who
 * has finished a boat's story is ready to go somewhere, and someone who has not is not
 * looking for an exit yet.
 */
export function BackNav({ destinations }: { destinations: Destination[] }) {
  return (
    <nav className="back-nav" aria-label="ไปยังส่วนอื่นของคลัง">
      {destinations.map((destination, index) => (
        <Link key={destination.href} href={destination.href} className={index === 0 ? "back-nav-primary" : undefined}>
          {index === 0 && <ArrowLeft aria-hidden="true" />}
          {destination.label}
        </Link>
      ))}
    </nav>
  );
}
