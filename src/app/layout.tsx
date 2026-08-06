import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "With Megan — Community Initiatives",
    template: "%s · With Megan",
  },
  description: "Community initiative portals for Tobago — Back to School Book Drive & Market Day Hamper Distribution.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}