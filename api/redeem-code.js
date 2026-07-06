export const config = { runtime: 'edge' };

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  const { code } = await req.json();
  const key = `code:${code.toUpperCase()}`;

  const getRes = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
  });
  const getData = await getRes.json();

  if (!getData.result) {
    return new Response(JSON.stringify({ valid: false, message: 'Code not found.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  if (getData.result === 'used') {
    return new Response(JSON.stringify({ valid: false, message: 'Code already used.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  await fetch(`${process.env.KV_REST_API_URL}/set/${key}/used`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
  });

  const codeId = code.toUpperCase();
  return new Response(JSON.stringify({ valid: true, codeId }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
