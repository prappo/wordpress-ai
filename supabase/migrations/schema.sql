-- Combined Schema Migration
-- This file combines all migrations into a single schema setup

-- Create customers table
create table if not exists
  public.customers (
    customer_id text not null,
    email text not null,
    open_ai_api_key text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint customers_pkey primary key (customer_id)
  ) tablespace pg_default;

-- Enable RLS for customers table
alter table public.customers enable row level security;

-- Create projects table
create table if not exists
  public.projects (
    id uuid not null default gen_random_uuid(),
    name text not null,
    customer_id text not null,
    type text not null default 'General',
    messages jsonb,
    code jsonb,
    content_url text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint projects_pkey primary key (id),
    constraint projects_customer_id_fkey foreign key (customer_id) references customers (customer_id)
  ) tablespace pg_default;

-- Enable RLS for projects table
alter table public.projects enable row level security;

-- Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "Enable read access for authenticated users to customers" on "public"."customers";
drop policy if exists "Enable insert access for authenticated users to customers" on "public"."customers";
drop policy if exists "Enable update access for authenticated users to customers" on "public"."customers";
drop policy if exists "Enable read access for authenticated users to projects" on "public"."projects";
drop policy if exists "Enable insert access for authenticated users to projects" on "public"."projects";
drop policy if exists "Enable update access for authenticated users to projects" on "public"."projects";
drop policy if exists "Enable delete access for authenticated users to projects" on "public"."projects";

-- Create RLS policies for customers table
create policy "Enable read access for authenticated users to customers"
  on public.customers for select
  to authenticated
  using (auth.email() = email);

create policy "Enable insert access for authenticated users to customers"
  on public.customers for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users to customers"
  on public.customers for update
  to authenticated
  using (true);

-- Create RLS policies for projects table
create policy "Enable read access for authenticated users to projects"
  on public.projects for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users to projects"
  on public.projects for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users to projects"
  on public.projects for update
  to authenticated
  using (true);

create policy "Enable delete access for authenticated users to projects"
  on public.projects for delete
  to authenticated
  using (true); 