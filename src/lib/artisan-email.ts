/** Keep registration and password recovery email checks consistent. */
export function isValidArtisanEmail(value:string):boolean {
 const email=value.trim();
 return email.length>0 && email.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
