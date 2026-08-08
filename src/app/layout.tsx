import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

function safeMetadataBase(): URL {
  const fallback = new URL("https://withmegan.com");
  try {
    const raw = process.env.NEXT_PUBLIC_APP_URL;
    if (raw && /^https?:\/\//.test(raw)) return new URL(raw);
    return fallback;
  } catch {
    return fallback;
  }
}

export const metadata: Metadata = {
  title: {
    default: "With Megan · Community Programmes",
    template: "%s · With Megan",
  },
  description:
    "Community programme portals for Tobago: Back to School Book Drive & Market Day Hamper Distribution.",
  metadataBase: safeMetadataBase(),
  openGraph: {
    title: "Back to School with Megan",
    description:
      "Free books and supplies for families in Mt. St. George/Goodwood, Tobago. Register in three minutes.",
    type: "website",
    images: [
      {
        url: "/images/tobago/bts-child-reading.jpg",
        width: 1200,
        height: 630,
        alt: "Child reading, Back to School with Megan",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    // BTS brand — used when the mobile browser chrome picks a tint.
    { media: "(prefers-color-scheme: light)", color: "#155e75" },
    { media: "(prefers-color-scheme: dark)", color: "#164e63" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
