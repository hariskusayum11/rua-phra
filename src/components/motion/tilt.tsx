"use client";

import { useCallback, useRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Maximum rotation in degrees at the far edge of the element. */
  max?: number;
  /** Set false to leave the moving highlight off — useful on already-bright photographs. */
  sheen?: boolean;
};

/**
 * Tips a photograph in space as the pointer crosses it, with a highlight that travels
 * like light moving over gold leaf.
 *
 * A rua phra is a gilded object that people walk around. A flat rectangle on a screen
 * loses that, and the nearest honest substitute is to let the photograph respond to where
 * the reader is looking rather than to invent a three-dimensional boat that nobody modelled.
 *
 * The component writes two numbers to CSS custom properties and never re-renders — React
 * state here would run a reconciliation on every pointer move for an effect that is purely
 * visual. Mouse pointers only: on a touch screen the finger is already on the thing it
 * would be tilting, and the rotation just fights the tap. Reduced motion is handled in CSS,
 * where it also covers a preference switched on after the page loaded.
 */
export function Tilt({ children, className, max = 5, sheen = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const track = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse") return;
      const node = ref.current;
      if (!node) return;
      const box = node.getBoundingClientRect();
      // -1 at the left/top edge, +1 at the right/bottom.
      const x = ((event.clientX - box.left) / box.width) * 2 - 1;
      const y = ((event.clientY - box.top) / box.height) * 2 - 1;
      node.style.setProperty("--tilt-x", `${(-y * max).toFixed(2)}deg`);
      node.style.setProperty("--tilt-y", `${(x * max).toFixed(2)}deg`);
      node.style.setProperty("--sheen-x", `${(((x + 1) / 2) * 100).toFixed(1)}%`);
      node.style.setProperty("--sheen-y", `${(((y + 1) / 2) * 100).toFixed(1)}%`);
      node.dataset.tilting = "true";
    },
    [max],
  );

  const release = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.dataset.tilting = "false";
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
  }, []);

  return (
    <div
      ref={ref}
      className={["tilt", className].filter(Boolean).join(" ")}
      data-sheen={sheen ? "true" : undefined}
      onPointerMove={track}
      onPointerLeave={release}
      onPointerCancel={release}
    >
      {children}
    </div>
  );
}
