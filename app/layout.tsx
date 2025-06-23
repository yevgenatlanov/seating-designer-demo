import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seat Map Designer",
  description: "Created by Yevhenii Atlanov",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
