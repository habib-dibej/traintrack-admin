import { createClient } from '@supabase/supabase-js';

  const supabaseUrl ='https://thncfhlmwmrlfbzllcfe.supabase.co';
  const supabaseKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobmNmaGxtd21ybGZiemxsY2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MTQ3OTcsImV4cCI6MjAyMzQ5MDc5N30.3SClHqdiJPCRrLpG4Og_me1wz26zUGMMrtRftcBotks';

  export const supabase = createClient(supabaseUrl, supabaseKey);
