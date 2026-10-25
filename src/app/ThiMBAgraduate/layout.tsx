import type { Metadata } from "next";
import { Tinos } from "next/font/google";

import "@/components/sites/lunera-nest/lunera-nest.css";
import { SongProvider } from "@/components/sites/lunera-nest/widgets/song-player";

// Fallback for Vietnamese glyphs missing from the Canva "Times New Roman MT" files
const tinos = Tinos({
  weight: ["400", "700"],
  subsets: ["vietnamese"],
  variable: "--font-ln-vi",
});

// Tab title vs. the preview card shown when the link is shared
const SHARE_TITLE = "Anh Thy thân mời bạn";
const SHARE_DESCRIPTION = "Design by Hoangthanh.pro";
// The invitation card cropped below the date line (no address or phone numbers);
// link previews need an absolute URL
const SHARE_IMAGE = {
  url: "/sites/lunera-nest/og-invitation.jpg",
  width: 1200,
  height: 1233,
  alt: "Thân mời Lễ Tốt Nghiệp - 11/11/2026 - 9h00",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://thy.hoangthanh110195.workers.dev"),
  title: "Anh Thy - Lễ Tốt Nghiệp",
  description: SHARE_DESCRIPTION,
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    type: "website",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [SHARE_IMAGE.url],
  },
};

export default function InvitationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={tinos.variable}>
      <SongProvider src="/sites/lunera-nest/media/newbeginning.mp3">{children}</SongProvider>
    </div>
  );
}
