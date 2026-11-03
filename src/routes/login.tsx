import { createFileRoute } from "@tanstack/react-router";
import { meta } from "@/components/store/SimplePage";
import { AccountForm } from "@/components/store/AccountForm";
export const Route = createFileRoute("/login")({ head: () => meta("Login", "Sign in to your Artisan Mart account."), component: () => <AccountForm /> });
