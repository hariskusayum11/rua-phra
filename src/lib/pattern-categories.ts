/** Thai names for the pattern categories stored in the database. One list for every page. */
export const patternCategoryLabels: Record<string, string> = {
  FLORAL: "ลายดอก",
  FOLIAGE: "ลายใบ",
  GEOMETRIC: "ลายเรขาคณิต",
  MYTHICAL: "ลายสัตว์หิมพานต์",
  OTHER: "อื่น ๆ",
};

export function patternCategoryLabel(category: string) {
  return patternCategoryLabels[category] ?? category;
}
