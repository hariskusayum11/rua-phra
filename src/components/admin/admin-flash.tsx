"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

/**
 * Carries the result of a save across the navigation that follows it.
 *
 * Saving sends the editor back to the list, so the confirmation cannot live in the form
 * that is about to be unmounted.
 *
 * Held in a module variable rather than session storage, because the navigation is a
 * client-side one and the module outlives it. That also gives the right behaviour for
 * free: a reload loses the message, and "บันทึกแล้ว" shown again on a page the editor
 * merely refreshed would be a lie.
 *
 * The message is tagged with the page it belongs to and read on every render rather than
 * consumed on the first one. Consuming it was a race: the save calls router.refresh() as
 * well, and if React remounted this component when the refreshed tree arrived, the second
 * mount found the message already taken and the banner vanished a moment after appearing.
 * Reading is idempotent; the message is dropped when the editor leaves the page instead.
 */
let pending: { message: string; path: string } | null = null;

export function flashMessage(message: string, path: string) {
  pending = { message, path };
}

export function AdminFlash() {
  const pathname = usePathname();
  const message = pending?.path === pathname ? pending.message : null;

  useEffect(() => {
    return () => {
      if (pending?.path === pathname) pending = null;
    };
  }, [pathname]);

  if (!message) return null;
  return (
    <div className="admin-feedback success" role="status">
      <CheckCircle2 aria-hidden="true" />
      <div>
        <span>{message}</span>
      </div>
    </div>
  );
}
