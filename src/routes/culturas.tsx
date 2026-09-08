import { createFileRoute } from "@tanstack/react-router";
import { EntityCrud } from "@/components/EntityCrud";

export const Route = createFileRoute("/culturas")({
  component: () => <EntityCrud entityKey="culturas" />,
});
