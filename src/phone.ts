import { prisma } from './db.js';

// Local seven-digit numbers are Grand Cayman numbers. Preserve other countries' codes.
export function phoneKey(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  let digits=phone.replace(/\D/g,'');
  if (digits.startsWith('00')) digits=digits.slice(2);
  if (digits.length===7) digits='1345'+digits;
  else if(digits.length===10) digits='1'+digits;
  return digits;
}
export async function phoneProblem(phone: string | null | undefined, exceptId?: number): Promise<string|null> {
  const key=phoneKey(phone);
  if (!key || key.length<10 || key.length>15 || !/^[+\d\s().-]+$/.test(phone!)) return 'Enter a valid phone number, including the country code for numbers outside Cayman.';
  const matches=await prisma.$queryRawUnsafe<{id:number}[]>('SELECT "id" FROM "User" WHERE ccc_phone_key("phone") = $1 AND "id" <> $2 LIMIT 1',key,exceptId??0);
  return matches.length ? 'This phone number is already registered. Log in to your existing account or use account recovery.' : null;
}
export function phoneConflict(error: unknown): boolean {
  const message=String(error);
  return /phoneKey|User_phone|phone_already_registered/.test(message);
}
