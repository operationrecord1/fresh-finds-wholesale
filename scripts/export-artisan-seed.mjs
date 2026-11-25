import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const input = await readFile("src/data/catalog.ts","utf8");
function match(pattern, label) {
 const found = input.match(pattern);
 if (!found) throw new Error("Catalog source missing " + label);
 return found[1];
}
const products = JSON.parse(match(/export const PRODUCTS: Product\[\] = (\[[\s\S]*?\n\]);/, "PRODUCTS"));
const categories = JSON.parse(match(/export const CATEGORIES = (\[[^\n]+\]);/, "CATEGORIES"));
const bands = [...input.matchAll(/\{ id: "(\d+)", label: "([^"]+)", min: ([\d.]+), max: (Infinity|[\d.]+) \}/g)]
  .map(x=>({id:x[1],label:x[2],min:Number(x[3]),max:x[4]==="Infinity"?null:Number(x[4])}));
const collections = [
 {slug:"new-arrivals",title:"Great New Arrivals",banner:"new",default_sort:"newest"},
 {slug:"best-sellers",title:"Best Sellers",banner:"best",default_sort:"position"},
 {slug:"reduced-price",title:"Reduced Price",banner:"reduced",default_sort:"position"},
 {slug:"closeouts",title:"Closeouts",banner:"closeout",default_sort:"position"},
 {slug:"imports",title:"Imports",banner:"imports",default_sort:"position"}
];
if (products.length!==125||new Set(products.map(p=>p.sku)).size!==125) throw new Error("125 unique product baseline invalid");
if (products.reduce((n,p)=>n+p.images.length,0)!==354) throw new Error("354 image baseline invalid");
if (categories.length!==32||bands.length!==10) throw new Error("Category/price bands changed");
const literal = (v,label) => {
 const json = JSON.stringify(v);
 const tag = "$artisan_"+label+"$";
 if(json.includes(tag)) throw new Error("Unexpected data delimiter");
 return tag + json + tag + "::jsonb";
};
let statements = ["begin;"];
for(let i=0;i<products.length;i+=25){
 statements.push(`with rows as (select value as v from jsonb_array_elements(${literal(products.slice(i,i+25),"products"+i)}))
insert into public.artisan_products(sku,title,price,original_price,stock,category,subcategory,description,upc,badges,collections,images,specs,purchase_rules,source_record)
select v->>'sku',v->>'title',(v->>'price')::numeric,(v->>'originalPrice')::numeric,(v->>'stock')::integer,v->>'category',v->>'subcategory',v->>'description',v->>'upc',
 coalesce(v->'badges','[]'::jsonb),coalesce(v->'collections','[]'::jsonb),coalesce(v->'images','[]'::jsonb),coalesce(v->'specs','{}'::jsonb),v->'rules',v from rows
on conflict(sku) do nothing;`);
}
statements.push(`insert into public.artisan_categories(name) select jsonb_array_elements_text(${literal(categories,"categories")}) on conflict do nothing;`);
statements.push(`insert into public.artisan_collections(slug,title,banner,default_sort) select x->>'slug',x->>'title',x->>'banner',x->>'default_sort' from jsonb_array_elements(${literal(collections,"collections")}) x on conflict do nothing;`);
statements.push(`insert into public.artisan_product_images(sku,sort_order,path) select p.sku,(e.ord-1)::integer,e.image from public.artisan_products p,lateral jsonb_array_elements_text(p.images) with ordinality as e(image,ord) on conflict do nothing;`);
statements.push(`insert into public.artisan_product_collections(sku,collection_slug) select p.sku,c.value from public.artisan_products p,lateral jsonb_array_elements_text(p.collections) as c(value) on conflict do nothing;`);
statements.push(`insert into public.artisan_shop_settings(key,value) values('order_minimum_usd','500'::jsonb),('currency','"USD"'::jsonb),('price_bands',${literal(bands,"bands")}) on conflict do nothing;`);
statements.push(`insert into public.artisan_coupons(code,mode,enabled,discount_amount,message) values('ARTISAN','demo',true,0,'Coupon code accepted for this demo. No discount has been applied.') on conflict do nothing;`);
statements.push("commit;");
const output = statements.join("\n\n") + "\n";
await writeFile("artisan-catalog-seed.sql",output);
console.log(JSON.stringify({products:products.length,images:354,categories:categories.length,collections:collections.length,bands:bands.length,sha256:createHash("sha256").update(output).digest("hex"),bytes:output.length}));
