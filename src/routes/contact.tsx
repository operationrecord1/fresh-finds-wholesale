import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Field, SimplePage, meta } from "@/components/store/SimplePage";

export const Route = createFileRoute("/contact")({ head: () => meta("Contact Us", "Contact Artisan Mart about new or existing orders."), component: Contact });

function Contact() {
  const [tab, setTab] = useState<"new" | "existing">("new");
  const [msg, setMsg] = useState("");
  return (
    <SimplePage title="Contact Us">
      <div className="flex gap-2">{(["new", "existing"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded px-4 py-2 ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{t === "new" ? "New Order Inquiry" : "Existing Order Inquiry"}</button>)}</div>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setMsg("Message not sent: contact form delivery is not connected yet."); }}>
        <Field label="Name" /><Field label="Email" type="email" />{tab === "existing" && <Field label="Order Number" />}
        <label className="block text-sm">Message<textarea required className="mt-1 w-full rounded border p-2" rows={4} /></label>
        <button className="rounded-full bg-primary px-6 py-2 font-bold text-primary-foreground">Submit</button>
        {msg && <p className="text-sm text-destructive">{msg}</p>}
      </form>
    </SimplePage>
  );
}
