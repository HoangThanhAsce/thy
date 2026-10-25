import type { Metadata } from "next";
import { Tinos } from "next/font/google";

import "@/components/sites/lunera-nest/lunera-nest.css";

// Fallback for Vietnamese glyphs missing from the Canva "Times New Roman MT" files
const tinos = Tinos({
  weight: ["400", "700"],
  subsets: ["vietnamese"],
  variable: "--font-ln-vi",
});

export const metadata: Metadata = {
  title: "template-black-gold-graduation-rsvp",
  openGraph: {
    title: "template-black-gold-graduation-rsvp",
    type: "website",
  },
};

export default function InvitationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={tinos.variable}>{children}</div>;
}
