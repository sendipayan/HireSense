export async function businessRegistryCheck(name: string) {
  if (!name) return { registered: false };

  try {
    const res = await fetch(
      `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(
        name
      )}`
    );

    const data = await res.json();
    return { registered: data?.results?.companies?.length > 0 };
  } catch {
    return { registered: false };
  }
}
