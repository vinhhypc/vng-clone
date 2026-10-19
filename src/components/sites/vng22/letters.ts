import lettersData from "./data/letters.json";

type LetterContent = { excerpt: string; body: string };

export type Letter = {
  id: number;
  subject: string;
  date: string;
  year: number;
  content: { vi?: LetterContent; en?: LetterContent };
};

export const LETTERS = lettersData as Letter[];

/** Vietnamese copy when available, otherwise the English original. */
export function letterContent(letter: Letter) {
  if (letter.content.vi) return { ...letter.content.vi, lang: "vi" };
  if (letter.content.en) return { ...letter.content.en, lang: "en" };
  return { excerpt: "", body: "", lang: "vi" };
}

/** The current year's letter has its own page instead of the modal reader. */
export const hasOwnPage = (letter: Letter) => letter.year === 2026;
