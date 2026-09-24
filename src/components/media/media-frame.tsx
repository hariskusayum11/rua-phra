import Image from "next/image";
import { ImageOff } from "lucide-react";
import { mediaUrl } from "@/lib/services/media";

/** "fill" covers whatever box the parent defines; everything else reserves that ratio. */
export type FrameRatio = "16/9" | "4/5" | "1/1" | "3/2" | "21/9" | "fill";

type FrameImage = {
  url: string | null;
  alt: string;
  width?: number | null;
  height?: number | null;
  credit?: string | null;
  /** Set on real photography by the import; null on placeholders. */
  focalX?: number | null;
  focalY?: number | null;
} | null;

type Props = {
  image: FrameImage;
  /** Locked to the ratio the production photograph will use, so nothing reflows on swap. */
  ratio: FrameRatio;
  sizes: string;
  priority?: boolean;
  className?: string;
  /**
   * Percentage focal point kept visible when the frame crops. Used only when the image
   * itself carries none — a real photograph's recorded focal point always wins, because
   * whoever looked at the picture knew better than the layout does.
   */
  focalX?: number;
  focalY?: number;
  /** Decorative frames pass an empty alt through and stay out of the accessibility tree. */
  decorative?: boolean;
  emptyLabel?: string;
};

/**
 * The single way the site puts a photograph on screen. It reserves the exact box before
 * the image arrives, so a slow network never shifts the layout, and it degrades to a
 * labelled empty frame rather than a broken image when the archive has no photograph yet.
 */
export function MediaFrame({
  image,
  ratio,
  sizes,
  priority = false,
  className,
  focalX = 50,
  focalY = 50,
  decorative = false,
  emptyLabel = "ภาพอยู่ระหว่างการบันทึกภาคสนาม",
}: Props) {
  const source = mediaUrl(image?.url);
  const classes = ["media-frame", ratio === "fill" && "media-frame-fill", className].filter(Boolean).join(" ");
  // The focal point travels as a custom property so a breakpoint can re-frame the crop
  // without the component knowing anything about layout.
  const box = {
    ...(ratio === "fill" ? {} : { aspectRatio: ratio }),
    "--focal-x": `${image?.focalX ?? focalX}%`,
    "--focal-y": `${image?.focalY ?? focalY}%`,
  } as React.CSSProperties;

  if (!source || !image) {
    return (
      <div className={classes} style={box} role="img" aria-label={decorative ? undefined : emptyLabel} aria-hidden={decorative || undefined}>
        <span className="media-frame-empty">
          <ImageOff aria-hidden="true" />
          {emptyLabel}
        </span>
      </div>
    );
  }

  return (
    <div className={classes} style={box}>
      <Image
        src={source}
        alt={decorative ? "" : image.alt}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={sizes}
        // The optimiser refuses SVG, and vector placeholders gain nothing from it. They
        // are served as plain files instead, which keeps dangerouslyAllowSVG switched off
        // for the real photographs that replace them.
        unoptimized={source.toLowerCase().endsWith(".svg")}
      />
    </div>
  );
}
