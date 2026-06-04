import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WINK",
  description: "You have a surprise waiting."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
