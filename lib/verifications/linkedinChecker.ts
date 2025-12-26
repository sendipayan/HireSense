const profileRegex =
  /^https:\/\/(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9-_%]+\/?$/;

export async function linkedinCheck(url: string) {
  if (!url || !profileRegex.test(url)) {
    return { valid: false, accessible: false };
  }

  try {
    const res = await fetch(url, { method: "GET" });

    if (res.status === 404) return { valid: true, accessible: false };

    // 403/999 means blocked but still exists
    return { valid: true, accessible: res.status < 500 };
  } catch {
    return { valid: true, accessible: false };
  }
}
