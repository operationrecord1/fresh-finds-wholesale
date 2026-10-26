import { createFileRoute } from "@tanstack/react-router";
import { SimplePage, meta } from "@/components/store/SimplePage";

export const Route = createFileRoute("/careers")({ head: () => meta("Careers", "Careers at Artisan Mart."), component: () => (
  <SimplePage title="Careers"><p>Artisan Mart job openings will be listed here.</p></SimplePage>
) });
