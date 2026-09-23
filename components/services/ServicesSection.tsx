import { SERVICES } from "@/lib/data/services";
import ServiceBlock from "./ServiceBlock";

export default function ServicesSection() {
  return (
    <div id="servicos">
      {SERVICES.map((service) => (
        <ServiceBlock key={service.id} service={service} />
      ))}
    </div>
  );
}
