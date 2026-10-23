import { create } from "zustand";

type CreateStudioState = {
  selectedId: string | null;
  category: string;
  query: string;
  preview: "outline" | "color";
  selectPattern: (id: string) => void;
  setCategory: (category: string) => void;
  setQuery: (query: string) => void;
  setPreview: (preview: "outline" | "color") => void;
};
export const useCreateStudio = create<CreateStudioState>()(set => ({
  selectedId: null, category: "ทั้งหมด", query: "", preview: "outline",
  selectPattern: selectedId => set({selectedId}),
  setCategory: category => set({category}),
  setQuery: query => set({query}),
  setPreview: preview => set({preview}),
}));
