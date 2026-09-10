-- Supabase Schema for Gasici Mito Dev Portfolio Admin
-- Project: wsajnfwotxodlkmvxzyc
-- Run this in Supabase SQL Editor

-- ============================================
-- EXTENSIONS
-- ============================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

-- Projects table
create table if not exists public.projects (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text,
    repo_url text,
    demo_url text,
    stack text[] not null default '{}',
    image_url text,
    image_alt text,
    category text,
    featured boolean default false,
    published boolean default true,
    sort_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Skills table
create table if not exists public.skills (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    category text not null,
    percentage integer not null check (percentage >= 0 and percentage <= 100),
    icon text,
    sort_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- About section
create table if not exists public.about (
    id uuid primary key default uuid_generate_v4(),
    bio text,
    stats jsonb not null default '{}',
    cta_text text,
    cta_link text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- CV / Experience
create table if not exists public.cv_experience (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    company text,
    period text,
    description text,
    stack text[] not null default '{}',
    sort_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- CV Education
create table if not exists public.cv_education (
    id uuid primary key default uuid_generate_v4(),
    degree text not null,
    institution text,
    year text,
    description text,
    sort_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- CV Contact info
create table if not exists public.cv_contact (
    id uuid primary key default uuid_generate_v4(),
    type text not null, -- location, phone, email, github, tiktok
    label text not null,
    value text not null,
    link text,
    icon text,
    sort_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- CV Skills (sidebar)
create table if not exists public.cv_skills (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    percentage integer not null check (percentage >= 0 and percentage <= 100),
    sort_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- CV Stack tags
create table if not exists public.cv_stack_tags (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    sort_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Languages
create table if not exists public.languages (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    level text not null,
    sort_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Interests
create table if not exists public.interests (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    sort_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Contact links
create table if not exists public.contact_links (
    id uuid primary key default uuid_generate_v4(),
    type text not null, -- phone, email, github, tiktok, portfolio, location
    label text not null,
    value text not null,
    link text,
    icon text,
    sort_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Media/Images
create table if not exists public.media (
    id uuid primary key default uuid_generate_v4(),
    filename text not null,
    original_name text,
    mime_type text,
    size_bytes integer,
    url text not null,
    path text not null,
    bucket text not null default 'portfolio',
    alt_text text,
    created_at timestamptz default now()
);

-- Admin users (extends Supabase auth)
create table if not exists public.admin_users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    full_name text,
    role text not null default 'admin' check (role in ('super_admin', 'admin', 'editor')),
    is_active boolean default true,
    last_login timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Audit logs
create table if not exists public.audit_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete set null,
    action text not null, -- create, update, delete, login, logout, failed_login
    table_name text,
    record_id uuid,
    old_data jsonb,
    new_data jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_projects_published on public.projects(published, sort_order);
create index if not exists idx_projects_featured on public.projects(featured, sort_order);
create index if not exists idx_skills_category on public.skills(category, sort_order);
create index if not exists idx_cv_experience_sort on public.cv_experience(sort_order);
create index if not exists idx_audit_logs_user on public.audit_logs(user_id, created_at desc);
create index if not exists idx_audit_logs_table on public.audit_logs(table_name, record_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.about enable row level security;
alter table public.cv_experience enable row level security;
alter table public.cv_education enable row level security;
alter table public.cv_contact enable row level security;
alter table public.cv_skills enable row level security;
alter table public.cv_stack_tags enable row level security;
alter table public.languages enable row level security;
alter table public.interests enable row level security;
alter table public.contact_links enable row level security;
alter table public.media enable row level security;
alter table public.admin_users enable row level security;
alter table public.audit_logs enable row level security;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Public read access for published content
create policy "Public read published projects" on public.projects
    for select using (published = true);

create policy "Public read skills" on public.skills
    for select using (true);

create policy "Public read about" on public.about
    for select using (true);

create policy "Public read cv_experience" on public.cv_experience
    for select using (true);

create policy "Public read cv_education" on public.cv_education
    for select using (true);

create policy "Public read cv_contact" on public.cv_contact
    for select using (true);

create policy "Public read cv_skills" on public.cv_skills
    for select using (true);

create policy "Public read cv_stack_tags" on public.cv_stack_tags
    for select using (true);

create policy "Public read languages" on public.languages
    for select using (true);

create policy "Public read interests" on public.interests
    for select using (true);

create policy "Public read contact_links" on public.contact_links
    for select using (true);

create policy "Public read media" on public.media
    for select using (true);

-- Admin full access (via admin_users table)
create policy "Admin full access projects" on public.projects
    for all using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

create policy "Admin full access skills" on public.skills
    for all using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

create policy "Admin full access about" on public.about
    for all using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

create policy "Admin full access cv_experience" on public.cv_experience
    for all using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

create policy "Admin full access cv_education" on public.cv_education
    for all using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

create policy "Admin full access cv_contact" on public.cv_contact
    for all using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

create policy "Admin full access cv_skills" on public.cv_skills
    for all using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

create policy "Admin full access cv_stack_tags" on public.cv_stack_tags
    for all using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

create policy "Admin full access languages" on public.languages
    for all using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

create policy "Admin full access interests" on public.interests
    for all using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

create policy "Admin full access contact_links" on public.contact_links
    for all using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

create policy "Admin full access media" on public.media
    for all using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

create policy "Admin read own profile" on public.admin_users
    for select using (id = auth.uid());

create policy "Super admin manage admins" on public.admin_users
    for all using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and role = 'super_admin' and is_active = true
        )
    );

create policy "Admin read audit logs" on public.audit_logs
    for select using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger set_projects_updated_at
    before update on public.projects
    for each row execute function public.handle_updated_at();

create trigger set_skills_updated_at
    before update on public.skills
    for each row execute function public.handle_updated_at();

create trigger set_about_updated_at
    before update on public.about
    for each row execute function public.handle_updated_at();

create trigger set_cv_experience_updated_at
    before update on public.cv_experience
    for each row execute function public.handle_updated_at();

create trigger set_cv_education_updated_at
    before update on public.cv_education
    for each row execute function public.handle_updated_at();

create trigger set_cv_contact_updated_at
    before update on public.cv_contact
    for each row execute function public.handle_updated_at();

create trigger set_cv_skills_updated_at
    before update on public.cv_skills
    for each row execute function public.handle_updated_at();

create trigger set_cv_stack_tags_updated_at
    before update on public.cv_stack_tags
    for each row execute function public.handle_updated_at();

create trigger set_languages_updated_at
    before update on public.languages
    for each row execute function public.handle_updated_at();

create trigger set_interests_updated_at
    before update on public.interests
    for each row execute function public.handle_updated_at();

create trigger set_contact_links_updated_at
    before update on public.contact_links
    for each row execute function public.handle_updated_at();

create trigger set_media_updated_at
    before update on public.media
    for each row execute function public.handle_updated_at();

create trigger set_admin_users_updated_at
    before update on public.admin_users
    for each row execute function public.handle_updated_at();

-- ============================================
-- AUDIT LOG TRIGGERS
-- ============================================
create or replace function public.audit_trigger()
returns trigger language plpgsql as $$
declare
    v_user_id uuid := auth.uid();
    v_old jsonb;
    v_new jsonb;
begin
    -- Get client info
    if (TG_OP = 'DELETE') then
        v_old = to_jsonb(OLD);
        v_new = null;
    elsif (TG_OP = 'INSERT') then
        v_old = null;
        v_new = to_jsonb(NEW);
    else
        v_old = to_jsonb(OLD);
        v_new = to_jsonb(NEW);
    end if;

    insert into public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    values (v_user_id, lower(TG_OP), TG_TABLE_NAME,
        case when TG_OP = 'DELETE' then OLD.id else NEW.id end,
        v_old, v_new);
    return NEW;
end;
$$;

-- Apply audit triggers to main tables
create trigger audit_projects
    after insert or update or delete on public.projects
    for each row execute function public.audit_trigger();

create trigger audit_skills
    after insert or update or delete on public.skills
    for each row execute function public.audit_trigger();

create trigger audit_about
    after insert or update or delete on public.about
    for each row execute function public.audit_trigger();

create trigger audit_cv_experience
    after insert or update or delete on public.cv_experience
    for each row execute function public.audit_trigger();

create trigger audit_cv_education
    after insert or update or delete on public.cv_education
    for each row execute function public.audit_trigger();

create trigger audit_cv_contact
    after insert or update or delete on public.cv_contact
    for each row execute function public.audit_trigger();

create trigger audit_cv_skills
    after insert or update or delete on public.cv_skills
    for each row execute function public.audit_trigger();

create trigger audit_cv_stack_tags
    after insert or update or delete on public.cv_stack_tags
    for each row execute function public.audit_trigger();

create trigger audit_languages
    after insert or update or delete on public.languages
    for each row execute function public.audit_trigger();

create trigger audit_interests
    after insert or update or delete on public.interests
    for each row execute function public.audit_trigger();

create trigger audit_contact_links
    after insert or update or delete on public.contact_links
    for each row execute function public.audit_trigger();

create trigger audit_media
    after insert or update or delete on public.media
    for each row execute function public.audit_trigger();

-- ============================================
-- STORAGE BUCKET FOR MEDIA
-- ============================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
on conflict (id) do update set
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Storage policies
create policy "Public read portfolio images" on storage.objects
    for select using (bucket_id = 'portfolio');

create policy "Admin upload portfolio images" on storage.objects
    for insert with check (
        bucket_id = 'portfolio' and
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

create policy "Admin update portfolio images" on storage.objects
    for update using (
        bucket_id = 'portfolio' and
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

create policy "Admin delete portfolio images" on storage.objects
    for delete using (
        bucket_id = 'portfolio' and
        exists (
            select 1 from public.admin_users
            where id = auth.uid() and is_active = true
        )
    );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================
create or replace function public.is_admin()
returns boolean language plpgsql security definer as $$
begin
    return exists (
        select 1 from public.admin_users
        where id = auth.uid() and is_active = true
    );
end;
$$;

create or replace function public.is_super_admin()
returns boolean language plpgsql security definer as $$
begin
    return exists (
        select 1 from public.admin_users
        where id = auth.uid() and role = 'super_admin' and is_active = true
    );
end;
$$;

-- ============================================
-- SEED DATA (run after creating admin user)
-- ============================================
-- Note: Run seed_data.sql separately after creating your admin user in Supabase Auth