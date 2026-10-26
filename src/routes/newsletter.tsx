import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Field, SimplePage, meta } from "@/components/store/SimplePage";

export const Route = createFileRoute("/newsletter")({ head: () => meta("Join Our Newsletter", "Get Artisan Mart deals and new arrivals by email."), component: N });

function N() {
  const [msg, setMsg] = useState("");
  return (
    <SimplePage title="Join Our Newsletter">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setMsg("Signup not saved: newsletter service is not connected yet."); }}>
        <Field label="Email" type="email" /><button className="rounded-full bg-primary px-6 py-2 font-bold text-primary-foreground">Subscribe</button>
        {msg && <p className="text-sm text-destructive">{msg}</p>}
      </form>
    </SimplePage>
  );
}
