
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0'

console.log("Hello from get-user-id-by-email function!")

serve(async (req) => {
  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the request body
    const { email } = await req.json();
    
    console.log(`Looking up user ID for email: ${email}`);

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Query the auth.users table directly using the service role
    const { data, error } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user ID:', error);
      return new Response(
        JSON.stringify({ error: `Failed to get user ID: ${error.message}` }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { headers: { 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log(`Found user ID: ${data.id}`);
    
    // Return the user ID
    return new Response(
      JSON.stringify(data.id),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
