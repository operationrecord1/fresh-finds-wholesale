import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Field, SimplePage, meta } from "@/components/store/SimplePage";

export const Route = createFileRoute("/login")({ head: () => meta("Login", "Sign in to your Artisan Mart account."), component: Login });

function Login() {
  const [msg, setMsg] = useState("");
  return (
    <SimplePage title="Customer Login">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setMsg("Sign-in is not connected yet (Firebase integration pending)."); }}>
        <Field label="Email" type="email" /><Field label="Password" type="password" />
        <a className="block text-sm text-primary underline" href="#forgot" onClick={(e) => { e.preventDefault(); setMsg("Password reset requires the Firebase integration."); }}>Forgot your password?</a>
        <button className="rounded-full bg-primary px-6 py-2 font-bold text-primary-foreground">Login</button>
        <div className="flex gap-2 text-sm">{["Google", "Facebook", "Amazon"].map((s) => <button type="button" key={s} onClick={() => setMsg(`${s} sign-in is not connected yet.`)} className="rounded border px-3 py-1">Sign in with {s}</button>)}</div>
        {msg && <p className="text-sm text-destructive">{msg}</p>}
      </form>
      <p>New customer? <Link to="/register" className="text-primary underline">Create An Account</Link></p>
    </SimplePage>
  );
}
