import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { artisanSupabase } from "./artisan-auth";
import type { Product } from "@/data/catalog";

const StockContext=createContext<Record<string,number>>({});
export function ArtisanStockProvider({children}:{children:ReactNode}){
 const [stock,setStock]=useState<Record<string,number>>({});
 useEffect(()=>{
  const client=artisanSupabase;if(!client)return;
  let active=true,inflight=false;
  const refresh=async()=>{
   if(inflight||document.visibilityState==="hidden")return;
   inflight=true;
   try{const {data,error}=await client.from("artisan_products").select("sku,stock");
    if(active&&!error&&data)setStock(Object.fromEntries(data.filter(p=>Number.isSafeInteger(p.stock)&&p.stock>=0).map(p=>[p.sku,p.stock])));
   }catch{/* Keep the last verified stock while the network reconnects. */}finally{inflight=false;}
  };
  void refresh();
  const interval=window.setInterval(()=>void refresh(),15000);
  const onRefresh=()=>void refresh();
  window.addEventListener("focus",onRefresh);window.addEventListener("artisan:stock-refresh",onRefresh);
  document.addEventListener("visibilitychange",onRefresh);
  return()=>{active=false;window.clearInterval(interval);window.removeEventListener("focus",onRefresh);window.removeEventListener("artisan:stock-refresh",onRefresh);document.removeEventListener("visibilitychange",onRefresh);};
 },[]);
 return <StockContext.Provider value={stock}>{children}</StockContext.Provider>;
}
export function useLiveProduct(product:Product):Product{
 const stock=useContext(StockContext)[product.sku];
 return stock===undefined?product:{...product,stock};
}
