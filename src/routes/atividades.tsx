import { createFileRoute } from "@tanstack/react-router";
import { EntityCrud } from "@/components/EntityCrud";

export const Route = createFileRoute("/atividades")({
  component: () => <EntityCrud entityKey="atividades" />,
});
