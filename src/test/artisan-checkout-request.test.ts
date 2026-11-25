import { describe,expect,it } from "vitest";
import { makeCheckoutRequest } from "@/lib/artisan-checkout-request";
const makeForm=()=>{
 const data=new FormData();
 for(const [key,value] of Object.entries({first_name:"Ana",last_name:"Customer",phone:"2125550123",line1:"123 Main St",city:"Austin",state:"TX",postal_code:"78701",shipping_first_name:"Ana",shipping_last_name:"Customer",shipping_phone:"2125550123",shipping_line1:"789 Oak St",shipping_city:"Dallas",shipping_state:"TX",shipping_postal_code:"75201"}))data.set(key,value);
 return data;
};
const key="artisan_checkout_test_123456789";
describe("Authoritative checkout request",()=>{
 it("passes quantities and validated addresses, never client totals",()=>{
  const result=makeCheckoutRequest(makeForm(),[{sku:"DA883",pieces:40,mode:"case"}],"ARTISAN",key,false);
  expect(result.items).toEqual([{sku:"DA883",quantity:40,mode:"case"}]);
  expect(result.billing.city).toBe("Austin");
  expect(result.shipping.city).toBe("Dallas");
  expect(result.coupon).toBe("ARTISAN");
  expect(Object.keys(result)).not.toContain("total_cents");
  expect(Object.keys(result)).not.toContain("tax_cents");
 });
 it("reuses billing when shipping is the same",()=>{
  const result=makeCheckoutRequest(makeForm(),[{sku:"DA883",pieces:40}],"",key,true);
  expect(result.shipping).toEqual(result.billing);
 });
 it("rejects duplicate products and invalid quantities",()=>{
  expect(()=>makeCheckoutRequest(makeForm(),[{sku:"DA883",pieces:40},{sku:"DA883",pieces:40}],"",key,true)).toThrow(/Duplicate/);
  expect(()=>makeCheckoutRequest(makeForm(),[{sku:"DA883",pieces:-1}],"",key,true)).toThrow(/Invalid product/);
 });
 it("rejects missing addresses and invalid session keys",()=>{
  const data=makeForm();data.delete("postal_code");
  expect(()=>makeCheckoutRequest(data,[{sku:"DA883",pieces:40}],"",key,true)).toThrow(/postal code/);
  expect(()=>makeCheckoutRequest(makeForm(),[{sku:"DA883",pieces:40}],"","bad",true)).toThrow(/session/);
 });
});
