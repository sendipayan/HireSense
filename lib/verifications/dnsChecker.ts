import dns from "dns/promises";
import { parse } from "tldts";

const FREE_EMAILS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];

export async function dnsCheck(email: string) {
  const rawDomain = email.split("@")[1]?.toLowerCase();

  // Extract registrable root (handles co.in, com.au, etc.)
  const parsed = parse(rawDomain);
  const domain = parsed.domain || rawDomain;

  const result = {
    domain, // <-- now tcs.co.in (not team.tcs.co.in)
    exists: false,
    hasMx: false,
    freeDomain: FREE_EMAILS.includes(domain),
  };

  try {
    const a = await dns.resolve(domain);
    const mx = await dns.resolveMx(domain);

    result.exists = a.length > 0;
    result.hasMx = mx.length > 0;
  } catch (err) {
    // safe fallback
  }

  return result;
}
