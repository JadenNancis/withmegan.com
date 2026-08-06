/**
 * Tiny class-name joiner — avoids pulling clsx/tailwind-merge for a prototype.
 * Filters falsy values and joins with spaces.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}