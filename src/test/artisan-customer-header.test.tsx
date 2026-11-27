import { render,screen,fireEvent,cleanup,waitFor } from "@testing-library/react";
import { afterEach,beforeEach,expect,it,vi } from "vitest";
import { SiteHeader } from "@/components/store/SiteHeader";

const state=vi.hoisted(()=>({
 user:{id:"qa-user",email:"qa@example.invalid",user_metadata:{first_name:"QA",last_name:"Customer"}} as null|{id:string;email:string;user_metadata:{first_name:string;last_name:string}},
 signOut:vi.fn(async()=>{}),
 navigate:vi.fn(),
}));
vi.mock("@tanstack/react-router",()=>({
 Link:({children,to,params,search,...props}:any)=><a href={to} {...props}>{children}</a>,
 useNavigate:()=>state.navigate,
}));
vi.mock("@/lib/cart",()=>({useCart:()=>({lines:[]})}));
vi.mock("@/lib/artisan-auth",()=>({
 artisanSupabase:null,
 useArtisanAuth:()=>({user:state.user,signOut:state.signOut,ready:true,recovery:false}),
}));
beforeEach(()=>{
 state.signOut=vi.fn(async()=>{});
 state.navigate=vi.fn();
 vi.stubGlobal("ResizeObserver",class{observe(){}disconnect(){}});
 vi.stubGlobal("matchMedia",()=>({matches:false}));
 Object.defineProperty(document,"fonts",{configurable:true,value:{ready:Promise.resolve()}});
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.clearAllMocks();});
it("shows customer name in one clickable account area with dropdown Logout",()=>{
 state.user={id:"qa-user",email:"qa@example.invalid",user_metadata:{first_name:"QA",last_name:"Customer"}};
 render(<SiteHeader/>);
 const account=screen.getByRole("button",{name:/QA/i});
 expect(account).toHaveAttribute("aria-haspopup","menu");
 expect(screen.queryByRole("menuitem",{name:"Logout"})).not.toBeInTheDocument();
 expect(screen.queryByText("Login Or")).not.toBeInTheDocument();
 fireEvent.click(account);
 expect(account).toHaveAttribute("aria-expanded","true");
 expect(screen.getByRole("menuitem",{name:"My Account"})).toBeInTheDocument();
 fireEvent.click(screen.getByRole("menuitem",{name:"Logout"}));
 expect(state.signOut).toHaveBeenCalledTimes(1);
});
it("restores existing guest Login/Register after sign-out",()=>{
 state.user={id:"qa-user",email:"qa@example.invalid",user_metadata:{first_name:"QA",last_name:"Customer"}};
 const {rerender}=render(<SiteHeader/>);
 state.user=null;
 rerender(<SiteHeader/>);
  expect(screen.getByText(/Login \/ Register/)).toBeInTheDocument();
 expect(screen.queryByRole("menuitem",{name:"Logout"})).not.toBeInTheDocument();
});

it("waits for a completed global signout before routing to login",async()=>{
 state.user={id:"qa-user",email:"qa@example.invalid",user_metadata:{first_name:"QA",last_name:"Customer"}};
 let release!:()=>void;
 state.signOut=vi.fn(()=>new Promise<void>(resolve=>{release=resolve;}));
 render(<SiteHeader/>);
 fireEvent.click(screen.getByRole("button",{name:/QA/i}));
 fireEvent.click(screen.getByRole("menuitem",{name:"Logout"}));
 expect(state.signOut).toHaveBeenCalledTimes(1);
 expect(state.navigate).not.toHaveBeenCalled();
 release();
 await waitFor(()=>expect(state.navigate).toHaveBeenCalledWith({to:"/login"}));
});
