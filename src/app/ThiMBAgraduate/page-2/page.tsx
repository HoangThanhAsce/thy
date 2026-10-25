import { CanvaPage } from "@/components/sites/lunera-nest/canva-page";
import { detailsPage } from "@/components/sites/lunera-nest/data/details";

export default function DetailsPage() {
  return <CanvaPage page={detailsPage} active="details" />;
}
