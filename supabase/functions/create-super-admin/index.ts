import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { email, password, fullName } = await req.json();

    // Create auth user (trigger will auto-create profile)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      throw new Error('Auth error: ' + authError.message);
    }

    if (!authData.user) {
      throw new Error('No user created');
    }

    // Wait for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update profile to grant super admin access
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_admin: true,
        admin_role: 'super_admin'
      })
      .eq('id', authData.user.id);

    if (updateError) {
      throw new Error('Profile update error: ' + updateError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Super admin created successfully',
        userId: authData.user.id
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error creating super admin:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});