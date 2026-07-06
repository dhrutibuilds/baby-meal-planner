export const config = { runtime: 'edge' };

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  const { codeId } = await req.json();
  if (codeId === 'master') {
    return new Response(JSON.stringify({ allowed: true, remaining: 999 }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const today = new Date().toISOString().slice(0, 10);
  const key = `usage:${codeId}:${today}`;

  const res = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
  });
  const data = await res.json();
  const count = parseInt(data.result || '0', 10);
  const LIMIT = 2;

  return new Response(JSON.stringify({ allowed: count < LIMIT, remaining: Math.max(0, LIMIT - count) }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
