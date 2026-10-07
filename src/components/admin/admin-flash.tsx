"use client";

import { useState } from "react";
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
 * Read during the first render rather than in an effect, so the banner is there on the
 * render that follows the save instead of appearing a frame later.
 */
let pending: string | null = null;

export function flashMessage(message: string) {
  pending = message;
}

export function AdminFlash() {
  const [message] = useState(() => {
    const value = pending;
    pending = null;
    return value;
  });

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
