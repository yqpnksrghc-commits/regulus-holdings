"use client";

import { ThemeProvider as NextThemes } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The brand leads with the cosmic (dark) atmosphere; the toggle preserves a
  // fully-supported light "daylight observatory". `enableSystem={false}` makes
  // dark the deliberate default rather than following the OS.
  return (
    <NextThemes attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      {children}
    </NextThemes>
  );
}
