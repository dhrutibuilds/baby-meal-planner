export const config = { runtime: 'edge' };

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default async function handler(req) {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });

  const url = new URL(req.url);
  if (url.searchParams.get('secret') !== process.env.ADMIN_SECRET) {
    return new Response('Forbidden', { status: 403 });
  }

  const codes = Array.from({ length: 15 }, randomCode);

  await Promise.all(codes.map(code =>
    fetch(`${process.env.KV_REST_API_URL}/set/code:${code}/active`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
    })
  ));

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: 'dhru2292@gmail.com',
      subject: 'Baby Meal Planner — New Invite Codes',
      text: `New invite codes:\n\n${codes.join('\n')}\n\nEach code is single-use (2 plan generations/day).`,
    }),
  });

  return new Response(JSON.stringify({ codes }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
