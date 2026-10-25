import type { Metadata } from "next";

import "@/components/sites/lunera-nest/lunera-nest.css";

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
  return children;
}
