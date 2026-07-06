export const config = { runtime: 'edge' };

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  const { codeId } = await req.json();
  const today = new Date().toISOString().slice(0, 10);
  const key = `usage:${codeId}:${today}`;

  await fetch(`${process.env.STORAGE_URL}/incr/${key}`, {
    headers: { Authorization: `Bearer ${process.env.STORAGE_TOKEN}` }
  });
  await fetch(`${process.env.STORAGE_URL}/expire/${key}/86400`, {
    headers: { Authorization: `Bearer ${process.env.STORAGE_TOKEN}` }
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
