export async function websiteCheck(url: string) {
  if (!url) return { reachable: false, canonicalHost: null, real: true };

  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;

    // Always use GET now — more compatible with CDNs
    const res = await fetch(fullUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Safari/537.36",
        Accept: "text/html",
      },
    });

    const reachable = res.status < 500;
    const canonicalHost = new URL(res.url).hostname;

    // Default assumption: real enough if host responds
    let real = reachable;

    // Try reading body *only if available* — ignore failures
    try {
      if (reachable) {
        const text = await res.text();
        const parked =
          /(parked|buy this domain|coming soon|under construction|namecheap|godaddy)/i;
        if (parked.test(text)) real = false;
      }
    } catch {
      // ignore body issues — do not penalize
    }

    return { reachable, canonicalHost, real };
  } catch {
    return { reachable: false, canonicalHost: null, real: false };
  }
}
