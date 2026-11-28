import { expect, it } from "vitest";
import { formatOrderNumber } from "@/lib/artisan-order-number";
it("uses one stable 3-7-7 reference for sequence, legacy RPC and formatted values",()=>{
 expect(formatOrderNumber(1)).toBe("114-5401022-4638625");
 expect(formatOrderNumber("AM-00000001")).toBe(formatOrderNumber(1));
 expect(formatOrderNumber("TEST-00000001")).toBe(formatOrderNumber(1));
 expect(formatOrderNumber(formatOrderNumber(14))).toBe(formatOrderNumber(14));
 expect(new Set(Array.from({length:1000},(_,n)=>formatOrderNumber(n+1))).size).toBe(1000);
 expect(()=>formatOrderNumber("garbage")).toThrow();
});
