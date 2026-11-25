import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js/max";

/** Keep user-entered digits and only a leading plus; strip pasted formatting safely. */
export function cleanPhoneInput(input:string):string {
 const normalized=input.replace(/[^\d+]/g,"");
 return (normalized.startsWith("+")?"+":"")+normalized.replace(/\+/g,"").slice(0,15);
}

export function formatPhoneInput(input:string):string {
 const raw=cleanPhoneInput(input);
 if(!raw)return "";
 if(raw==="+")return "+";
 const parser=parsePhoneNumberFromString(raw, {defaultCountry:"US",extract:false});
 if(parser?.country==="US" && parser.isPossible() && raw.replace(/\D/g,"").length>=10){
   return "+1 "+parser.formatNational();
 }
 return new AsYouType(raw.startsWith("+")?undefined:"US").input(raw);
}

/** Validity does not prove ownership. A plain 10-digit number is US-default. */
export function toE164Phone(input:string):string | null {
 const raw=cleanPhoneInput(input);
 if(!raw || raw.length>16 || (raw.startsWith("+")&&raw.length<3))return null;
 // Unprefixed numbers other than a US 10-digit national number are ambiguous.
 if(!raw.startsWith("+") && !/^\d{10}$/.test(raw))return null;
 const parsed=parsePhoneNumberFromString(raw,{defaultCountry:"US",extract:false});
 return parsed?.isValid() ? parsed.number : null;
}

export function validatePhoneNumber(input:string):string|null{
 return toE164Phone(input) ? null : "Enter a valid phone number with its country code, or a 10-digit US number.";
}
