import { parse } from "tldts";

export function emailMatchesCompany(email: string, website: string) {
  try {
    const emailDomain = email.split("@")[1].toLowerCase();

    const host = new URL(
      website.startsWith("http") ? website : `https://${website}`
    ).hostname.toLowerCase();

    // registrable domain extraction — handles .com, .co.in, .com.au, etc.
    const emailRoot = parse(emailDomain).domain;
    const companyRoot = parse(host).domain;

    if (!emailRoot || !companyRoot) return false;

    // Allow exact domain or sub-domain of the company domain
    return (
      emailDomain === host || // exact match
      emailDomain.endsWith("." + host) || // subdomain of host
      emailRoot === companyRoot // same registrable root
    );
  } catch {
    return false;
  }
}
