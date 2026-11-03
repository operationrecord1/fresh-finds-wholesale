import { createFileRoute } from "@tanstack/react-router";
import { meta } from "@/components/store/SimplePage";
import { AccountForm } from "@/components/store/AccountForm";
export const Route = createFileRoute("/register")({ head: () => meta("Create An Account", "Register for an Artisan Mart wholesale account."), component: () => <AccountForm register /> });
