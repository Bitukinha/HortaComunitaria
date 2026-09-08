import { createFileRoute } from "@tanstack/react-router";
import { EntityCrud } from "@/components/EntityCrud";

export const Route = createFileRoute("/plantios")({
  component: () => <EntityCrud entityKey="plantios" />,
});
