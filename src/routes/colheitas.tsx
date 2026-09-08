import { createFileRoute } from "@tanstack/react-router";
import { EntityCrud } from "@/components/EntityCrud";

export const Route = createFileRoute("/colheitas")({
  component: () => <EntityCrud entityKey="colheitas" />,
});
