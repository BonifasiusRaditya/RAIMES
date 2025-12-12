// Simple utility to merge Tailwind classes
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
