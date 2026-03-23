export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return new Response('Missing LinkedIn OAuth environment variables.', {
      status: 500,
    });
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid profile email',
    state: crypto.randomUUID(), // CSRF protection
  });

  return Response.redirect(
    `https://www.linkedin.com/oauth/v2/authorization?${params}`
  );
}
