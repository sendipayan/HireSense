import type { VerificationSignals } from "@/types/verifySignals";

export function computeTrustScore(signals: VerificationSignals): number {
  let score = 0;

  //
  // 1) DOMAIN & EMAIL SIGNALS
  //
  if (signals.dns.exists) score += 10;
  if (signals.dns.hasMx) score += 10;

  // Free email is risky — but do not punish too hard (startups)
  if (signals.dns.freeDomain) score -= 10;

  // Very strong trust: email belongs to the same domain as company site
  if (signals.emailVerified) score += 20;
  else score -= 20; // look-alike / mismatched domain — suspicious

  //
  // 2) WEBSITE
  //
  if (signals.website.real) score += 10;
  else if (signals.website.reachable && !signals.website.real) score -= 5;

  //
  // 3) LINKEDIN PRESENCE
  //
  // Recruiter
  if (signals.linkedinRecruiter.valid) score += 5;
  if (signals.linkedinRecruiter.accessible) score += 10;

  // Company
  if (signals.linkedinCompany.valid) score += 5;
  if (signals.linkedinCompany.accessible) score += 10;

  //
  // 4) COMPANY REGISTRY
  //
  // Treat "not found" as neutral — many startups won’t appear yet.
  if (signals.registry.registered) score += 10;

  //
  // 5) FINAL NORMALIZATION
  //
  // Never let score exceed 100 or drop below 0.
  score = Math.max(0, Math.min(score, 100));

  return score;
}
