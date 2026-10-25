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

export const metadata: Metadata = {
  title: "Anh Thy - Lễ Tốt Nghiệp",
  description: SHARE_DESCRIPTION,
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
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
