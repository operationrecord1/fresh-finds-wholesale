import { createFileRoute } from "@tanstack/react-router";
import { meta } from "@/components/store/SimplePage";
import { AboutPage } from "@/components/store/AboutPage";
export const Route = createFileRoute("/about-us")({ head: () => meta("About Us", "Explore Artisan Market: industries, community, shipping and wholesale guides."), component: AboutPage });
