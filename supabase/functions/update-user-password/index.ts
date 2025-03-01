
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0'

console.log("Hello from update-user-password function!")

serve(async (req) => {
  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the request body
    const { userId, password } = await req.json();
    
    console.log(`Updating password for user ID: ${userId}`);

    if (!userId || !password) {
      return new Response(
        JSON.stringify({ error: 'User ID and password are required' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Use the admin_update_user_password function to update the password
    const { data, error } = await supabase.rpc('admin_update_user_password', {
      user_id: userId,
      new_password: password
    });

    if (error) {
      console.error('Error updating user password:', error);
      return new Response(
        JSON.stringify({ error: `Failed to update password: ${error.message}` }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Password updated successfully for user ID: ${userId}`);
    
    // Return success
    return new Response(
      JSON.stringify({ success: true }),
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
