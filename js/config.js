/* Online layer settings. Leave both empty to run fully offline (data stays on the phone).
   To switch on accounts, shared groups and server-side checks, create a free Supabase project,
   run supabase/schema.sql, then paste the Project URL and the anon (public) key here.
   The anon key is meant to be public; the database rules protect the data. Never paste the service_role key. */
window.GC_CONFIG = { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' };
