-- LeadPulz AI — tenant isolation via Row Level Security (Supabase / PostgreSQL)
--
-- Every tenant-scoped table exposes organization_id. A helper reads the caller's
-- organization memberships from the JWT (app_metadata.org_ids) so policies stay
-- uniform. Platform admins bypass via the service role only.

create or replace function auth.org_ids() returns text[] language sql stable as $$
  select coalesce(
    (select array_agg(value::text) from jsonb_array_elements_text(
      coalesce(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' -> 'org_ids', '[]'::jsonb)
    )),
    '{}'::text[]
  );
$$;

-- Apply the same policy set to each tenant table.
do $$
declare t text;
begin
  foreach t in array array[
    'organization_members','workspaces','agents','phone_numbers','calls','contacts','leads',
    'appointments','campaigns','knowledge_bases','knowledge_documents','integrations','workflows',
    'subscriptions','usage_records','api_keys','webhooks','notifications','audit_logs','follow_up_sequences'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists tenant_isolation on %I', t);
    execute format(
      'create policy tenant_isolation on %I using (organization_id = any(auth.org_ids())) with check (organization_id = any(auth.org_ids()))', t);
  end loop;
end $$;

-- Child tables inherit isolation through their parent (joins), e.g. call_transcripts → calls.
alter table call_transcripts enable row level security;
create policy tenant_isolation on call_transcripts using (
  exists (select 1 from calls c where c.id = call_transcripts.call_id and c.organization_id = any(auth.org_ids()))
);
alter table call_recordings enable row level security;
create policy tenant_isolation on call_recordings using (
  exists (select 1 from calls c where c.id = call_recordings.call_id and c.organization_id = any(auth.org_ids()))
);
alter table call_events enable row level security;
create policy tenant_isolation on call_events using (
  exists (select 1 from calls c where c.id = call_events.call_id and c.organization_id = any(auth.org_ids()))
);

-- Vector store for knowledge chunks (pgvector)
create extension if not exists vector;
create table if not exists knowledge_chunks (
  id bigserial primary key,
  organization_id text not null,
  document_id text not null references knowledge_documents(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}'::jsonb
);
create index if not exists knowledge_chunks_embedding_idx on knowledge_chunks using ivfflat (embedding vector_cosine_ops);
alter table knowledge_chunks enable row level security;
create policy tenant_isolation on knowledge_chunks using (organization_id = any(auth.org_ids()));

-- Realtime: publish call + notification changes per organization
alter publication supabase_realtime add table calls, call_transcripts, notifications, campaigns;
