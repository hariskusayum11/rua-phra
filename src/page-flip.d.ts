declare module "page-flip" {
  export class PageFlip {
    constructor(element: HTMLElement, settings: { width: number; height: number; size: string; startPage: number; showCover: boolean; usePortrait: boolean; autoSize: boolean; drawShadow: boolean; maxShadowOpacity: number; flippingTime: number; useMouseEvents: boolean; mobileScrollSupport: boolean; clickEventForward: boolean; showPageCorners: boolean; disableFlipByClick: boolean });
    on(event: string, callback: (event: { data: string | number }) => void): void;
    loadFromHTML(pages: HTMLElement[]): void;
    destroy(): void;
    flipPrev(): void;
    flipNext(): void;
    flip(page: number): void;
  }
}
