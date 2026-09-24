"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** Milliseconds added to the transition delay; used to stagger siblings. */
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "figure" | "header" | "p";
  className?: string;
  id?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
  /** Lets a parent tag a revealed item for layout, e.g. which lane a word sits in. */
  "data-lane"?: string;
};

/**
 * Fade and lift a block once, the first time it enters the viewport.
 *
 * Content is present and readable before the observer ever runs — the animation only
 * removes an opacity, it never gates the markup — so search engines, printers and anyone
 * with reduced motion enabled see a finished page. The CSS honours
 * prefers-reduced-motion, and a <noscript> rule in the root layout covers scripting
 * being unavailable, which is why this hook never needs to.
 */
export function Reveal({ children, delay = 0, as = "div", className, ...rest }: Props) {
  const nodeRef = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  const attach = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || shown) return;
    if (typeof IntersectionObserver === "undefined") {
      // No observer means no reveal to schedule: mark the element shown directly rather
      // than re-rendering, and leave it that way.
      node.dataset.shown = "true";
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shown]);

  // Widening the tag drops the per-element ref typing, which is what lets one component
  // render as a li inside a list and a figure inside a section.
  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={attach}
      className={["reveal", className].filter(Boolean).join(" ")}
      data-shown={shown}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
