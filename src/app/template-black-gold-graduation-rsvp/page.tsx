import { CanvaPage } from "@/components/sites/lunera-nest/canva-page";
import { invitationPage } from "@/components/sites/lunera-nest/data/invitation";

export default function InvitationPage() {
  return <CanvaPage page={invitationPage} active="invitation" />;
}
