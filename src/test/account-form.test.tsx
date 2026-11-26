import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AccountForm } from "@/components/store/AccountForm";

const auth = vi.hoisted(() => ({
  user: null as null | { id:string; email_confirmed_at?:string },
  ready: true,
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  resend: vi.fn(),
  navigate: vi.fn(),
}));
vi.mock("@tanstack/react-router",()=>({Link:({children,to}:any)=><a href={to}>{children}</a>,useNavigate:()=>auth.navigate}));
vi.mock("@/lib/artisan-auth",()=>({
  artisanSupabase:{auth:{signUp:auth.signUp,signInWithPassword:auth.signInWithPassword,resend:auth.resend}},
  useArtisanAuth:()=>({user:auth.user,ready:auth.ready}),
}));

afterEach(()=>{cleanup();vi.clearAllMocks();});
beforeEach(()=>{auth.user=null;auth.ready=true;auth.signUp.mockReset();auth.signInWithPassword.mockReset();auth.resend.mockReset();});

it("does not inject a disposable address or sales representative into signup",()=>{
  render(<AccountForm register/>);
  expect(screen.getByLabelText(/Email address/)).toHaveValue("");
  expect(screen.getByLabelText(/Email address/)).toHaveAttribute("autocomplete","off");
  expect(screen.queryByLabelText(/Sales representative/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/jicek69439@forims\.com/i)).not.toBeInTheDocument();
});

it("shows an actionable signup error when profile persistence fails",async()=>{
  auth.signUp.mockResolvedValue({data:{user:null},error:{code:"unexpected_failure",status:500,message:"Database error saving new user"}});
  render(<AccountForm register/>);
  fireEvent.change(screen.getByLabelText(/First name/),{target:{value:"Morgan"}});
  fireEvent.change(screen.getByLabelText(/Last name/),{target:{value:"Customer"}});
  fireEvent.change(screen.getByLabelText(/Phone/),{target:{value:"2125550123"}});
  fireEvent.change(screen.getByLabelText(/Email address/),{target:{value:"morgan@example.com"}});
  fireEvent.change(screen.getByLabelText(/^Password/),{target:{value:"MyLongPassword9!"}});
  fireEvent.change(screen.getByLabelText(/Confirm password/),{target:{value:"MyLongPassword9!"}});
  fireEvent.click(screen.getByLabelText(/I agree to the Terms of Sale/));
  fireEvent.click(screen.getByRole("button",{name:/Create account/}));
  await waitFor(()=>expect(auth.signUp).toHaveBeenCalledOnce());
  expect(await screen.findByRole("status")).toHaveTextContent(/couldn’t save this signup/i);
});

