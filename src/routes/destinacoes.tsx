import { createFileRoute } from "@tanstack/react-router";
import { EntityCrud } from "@/components/EntityCrud";

export const Route = createFileRoute("/destinacoes")({
  component: () => <EntityCrud entityKey="destinacoes" />,
});
