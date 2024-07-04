import { createClient } from '@supabase/supabase-js';

  const supabaseUrl ='https://hmmuuwerikzgmmfvmhgo.supabase.co';
  const supabaseKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXV1d2VyaWt6Z21tZnZtaGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkzNjQwNDksImV4cCI6MjAyNDk0MDA0OX0.Mr997w6DIVkflqY2VPScfg_s_DxBcw1Ccw9GExnZR2A';

  export const supabase = createClient(supabaseUrl, supabaseKey);
