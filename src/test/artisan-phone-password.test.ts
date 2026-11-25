import { isValidArtisanEmail } from "@/lib/artisan-email";
import { describe,expect,it } from "vitest";
import { cleanPhoneInput,formatPhoneInput,toE164Phone,validatePhoneNumber } from "@/lib/artisan-phone";
import { passwordChecks,validateArtisanPassword } from "@/lib/artisan-password";
describe("International phone validation",()=>{
 it("formats a US domestic number into +1 display and E.164",()=>{
  expect(formatPhoneInput("2125550123")).toBe("+1 (212) 555-0123");
  expect(toE164Phone("2125550123")).toBe("+12125550123");
 });
 it("does not convert international UK or Bangladesh input into US",()=>{
  expect(toE164Phone("+442071838750")).toBe("+442071838750");
  expect(toE164Phone("+8801712345678")).toBe("+8801712345678");
 });
 it("strips pasted letters and repeated or misplaced plus signs",()=>{
  expect(cleanPhoneInput(" +1 ++(212)555-a0123 ")).toBe("+12125550123");
  expect(cleanPhoneInput("212+555+0123")).toBe("2125550123");
  expect(cleanPhoneInput("abc")).toBe("");
 });
 it("rejects incomplete, invalid international or ambiguous national values",()=>{
  expect(validatePhoneNumber("123")).not.toBeNull();
  expect(toE164Phone("+999123456789")).toBeNull();
  expect(toE164Phone("01712345678")).toBeNull();
 });
});
describe("Original password policy live states",()=>{
 it("checks length, uppercase, lowercase, digit, symbol independently",()=>{
  const checks=Object.fromEntries(passwordChecks.map(x=>[x.id,x.test("lowercaseonly")]));
  expect(checks).toEqual({length:true,upper:false,lower:true,number:false,symbol:false});
 });
 it("accepts only passwords satisfying all requirements",()=>{
  expect(validateArtisanPassword("MyLongPassword9!")).toBeNull();
  expect(validateArtisanPassword("password")).not.toBeNull();
  expect(validateArtisanPassword("LONGPASSWORD9!")).not.toBeNull();
 });
});

describe("Consistent auth email validation",()=>{
 it("accepts legitimate production customer addresses",()=>{
  expect(isValidArtisanEmail("customer@example.com")).toBe(true);
  expect(isValidArtisanEmail("name+orders@artisanmart.site")).toBe(true);
  expect(isValidArtisanEmail(" customer@example.com ")).toBe(true);
 });
 it("rejects malformed, whitespace and excessively long addresses",()=>{
  for(const email of ["","not-an-email","abc@example","abc @example.com","abc@example com","a".repeat(255)+"@example.com"]){
   expect(isValidArtisanEmail(email)).toBe(false);
  }
 });
});
