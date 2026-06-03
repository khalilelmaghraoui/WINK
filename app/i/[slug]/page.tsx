import type { Metadata } from "next";

const genericPreview = "You have a surprise waiting.";

export const metadata: Metadata = {
  title: "Frisson",
  description: genericPreview,
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    title: "Frisson",
    description: genericPreview,
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Frisson",
    description: genericPreview
  }
};

export default function InvitePage() {
  return null;
}
