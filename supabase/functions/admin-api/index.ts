import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/admin-api', '');

    // GET /stats — dashboard metrics
    if (path === '/stats' && req.method === 'GET') {
      const { data, error } = await adminClient.rpc('get_admin_stats');
      if (error) throw error;
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /approve-instagram — approve submission
    if (path === '/approve-instagram' && req.method === 'POST') {
      const { submission_id } = await req.json();
      const { error } = await adminClient.rpc('approve_instagram_submission', {
        p_submission_id: submission_id,
      });
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /reject-instagram — reject submission
    if (path === '/reject-instagram' && req.method === 'POST') {
      const { submission_id, notes } = await req.json();
      const { error } = await adminClient.rpc('reject_instagram_submission', {
        p_submission_id: submission_id,
        p_notes: notes || 'Rejected by admin',
      });
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
