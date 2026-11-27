import { createFileRoute } from "@tanstack/react-router";
import { CustomerOrderHistory } from "@/components/store/CustomerOrderHistory";
export const Route=createFileRoute("/orders")({validateSearch:(s:Record<string,unknown>):{order?:string}=>typeof s["order"]==="string"&&/^[0-9a-f-]{36}$/i.test(s["order"])?{order:s["order"]}:{},head:()=>({meta:[{title:"Your Orders | Artisan Mart"}]}),component:Orders});
function Orders(){const {order}=Route.useSearch();return <main><CustomerOrderHistory orderId={order} standalone/></main>;}
