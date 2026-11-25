export const PASSWORD_REQUIREMENTS = "Use 12–128 characters with uppercase, lowercase, a number, and a symbol.";
export const passwordChecks = [
 {id:"length",label:"12–128 characters",test:(p:string)=>p.length>=12&&p.length<=128},
 {id:"upper",label:"At least one uppercase letter",test:(p:string)=>/[A-Z]/.test(p)},
 {id:"lower",label:"At least one lowercase letter",test:(p:string)=>/[a-z]/.test(p)},
 {id:"number",label:"At least one number",test:(p:string)=>/[0-9]/.test(p)},
 {id:"symbol",label:"At least one special character",test:(p:string)=>/[^A-Za-z0-9]/.test(p)},
] as const;
export function validateArtisanPassword(password:string):string|null{
 return passwordChecks.every(c=>c.test(password))?null:PASSWORD_REQUIREMENTS;
}
