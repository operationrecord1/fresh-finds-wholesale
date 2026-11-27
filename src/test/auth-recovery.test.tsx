import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Route as ForgotRoute } from "@/routes/forgot-password";
import { Route as ResetRoute } from "@/routes/reset-password";
const auth=vi.hoisted(()=>({resetPasswordForEmail:vi.fn(),updateUser:vi.fn(),signOut:vi.fn(),state:{user:null as null|{id:string},ready:true,recovery:false}}));
vi.mock("@tanstack/react-router",()=>({createFileRoute:()=> (options:any)=>options,Link:({to,children}:any)=><a href={to}>{children}</a>}));
vi.mock("@/lib/artisan-auth",()=>({artisanSupabase:{auth},useArtisanAuth:()=>auth.state}));
const Forgot=(ForgotRoute as unknown as {component:()=>React.ReactNode}).component;
const Reset=(ResetRoute as unknown as {component:()=>React.ReactNode}).component;
afterEach(cleanup);
beforeEach(()=>{vi.clearAllMocks();auth.state={user:null,ready:true,recovery:false};});
it("requests recovery with the correct callback and neutral success message",async()=>{
 auth.resetPasswordForEmail.mockResolvedValue({error:null});render(<Forgot/>);
 fireEvent.change(screen.getByLabelText(/Email address/),{target:{value:"Customer@Example.com"}});
 fireEvent.click(screen.getByRole("button",{name:/Send Reset Link/}));
 await waitFor(()=>expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("customer@example.com",{redirectTo:window.location.origin+"/reset-password"}));
 expect(await screen.findByRole("status")).toHaveTextContent(/If an Artisan Mart account exists/);
});
it("does not expose a password form without a recovery session",()=>{
 render(<Reset/>);expect(screen.getByRole("alert")).toHaveTextContent(/invalid, expired/);
 expect(screen.queryByLabelText(/New password/)).not.toBeInTheDocument();
});
it("keeps password validation and signs out after a successful recovery",async()=>{
 auth.state={user:{id:"test"},ready:true,recovery:true};
 auth.updateUser.mockResolvedValue({error:null});auth.signOut.mockResolvedValue({error:null});
 render(<Reset/>);
 fireEvent.change(screen.getByLabelText(/New password/),{target:{value:"weak"}});
 fireEvent.change(screen.getByLabelText(/Confirm password/),{target:{value:"weak"}});
 fireEvent.submit(screen.getByRole("button",{name:"Update Password"}).closest("form")!);
 expect(auth.updateUser).not.toHaveBeenCalled();
 for(const label of [/New password/,/Confirm password/])fireEvent.change(screen.getByLabelText(label),{target:{value:"StrongPassword!24"}});
 fireEvent.submit(screen.getByRole("button",{name:"Update Password"}).closest("form")!);
 await waitFor(()=>expect(auth.updateUser).toHaveBeenCalledWith({password:"StrongPassword!24"}));
 expect(auth.signOut).toHaveBeenCalledWith({scope:"global"});
 expect(await screen.findByRole("status")).toHaveTextContent(/password has been changed/);
});
