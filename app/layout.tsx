import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/data";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["italic", "normal"],
  weight: ["400", "500"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = "https://zakariyasayed.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Zakariya Sayed — Digital Marketing & Business Operations",
    template: "%s — Zakariya Sayed",
  },
  description:
    "Zakariya Sayed is a Digital Marketing & Business Operations professional with 4+ years bridging marketing, operations, strategy and execution — brand building, performance marketing, e-commerce and procurement.",
  keywords: [
    "Zakariya Sayed",
    "Digital Marketing",
    "Business Operations",
    "Brand Building",
    "Performance Marketing",
    "E-commerce",
    "Content Strategy",
    "Procurement",
    "Mumbai",
  ],
  authors: [{ name: "Zakariya Sayed" }],
  creator: "Zakariya Sayed",
  openGraph: {
    title: "Zakariya Sayed — Digital Marketing & Business Operations",
    description:
      "4+ years bridging marketing, operations, strategy and execution. Brand building, performance marketing, e-commerce and business growth.",
    url: siteUrl,
    siteName: "Zakariya Sayed",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zakariya Sayed — Digital Marketing & Business Operations",
    description:
      "4+ years bridging marketing, operations, strategy and execution.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
};

export const viewport: Viewport = {
  themeColor: "#0D0D0D",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "Digital Marketing & Business Operations Professional",
  email: `mailto:${site.email}`,
  telephone: site.phoneHref,
  address: { "@type": "PostalAddress", addressLocality: site.location },
  url: siteUrl,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${serif.variable} ${sans.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
