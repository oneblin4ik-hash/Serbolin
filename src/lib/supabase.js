import { createClient } from '@supabase/supabase-js';

const URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://vqoorbjzqgvznzlpemwq.supabase.co';
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb29yYmp6cWd2em56bHBlbXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODcwNDcsImV4cCI6MjA5MjM2MzA0N30.ddvG-XIM5NZYygTrW26080hBFBFsMCO9Z9xtat27XEo';

export const supabase = createClient(URL, KEY);
