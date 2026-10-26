import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Field, SimplePage, meta } from "@/components/store/SimplePage";

export const Route = createFileRoute("/register")({ head: () => meta("Create An Account", "Register for an Artisan Mart wholesale account."), component: Register });

function Register() {
  const [msg, setMsg] = useState("");
  return (
    <SimplePage title="Create An Account">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setMsg("Registration is not connected yet (Firebase integration pending). No account was created."); }}>
        <h2 className="font-bold">Personal Information</h2>
        <div className="grid grid-cols-2 gap-3"><Field label="First Name" /><Field label="Last Name" /></div>
        <Field label="Phone" type="tel" />
        <label className="block text-sm">Sales Representative<select className="mt-1 w-full rounded border p-2"><option>Web Customer</option></select></label>
        <h2 className="font-bold">Login Information</h2>
        <Field label="Email" type="email" /><Field label="Password" type="password" /><Field label="Confirm Password" type="password" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Sign up for newsletter</label>
        <button className="rounded-full bg-primary px-6 py-2 font-bold text-primary-foreground">Submit</button>
        {msg && <p className="text-sm text-destructive">{msg}</p>}
      </form>
    </SimplePage>
  );
}
