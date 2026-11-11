-- Run this in the Supabase SQL Editor after creating your project.
-- Then create toludav2015@gmail.com as a confirmed user in Authentication > Users.

create table if not exists public.site_content (
  id text primary key check (id = 'homepage'),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated users can update site content" on public.site_content;
create policy "Authenticated users can update site content"
  on public.site_content for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'toludav2015@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'toludav2015@gmail.com');

drop policy if exists "Authenticated users can insert site content" on public.site_content;
create policy "Authenticated users can insert site content"
  on public.site_content for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'toludav2015@gmail.com');

insert into public.site_content (id, content)
values ('homepage', '{
  "headline": "Design it. Build it. Power it.",
  "heroDescription": "From a brand people remember to a website that works for you, and from clean solar power to safe, tidy wiring — Linton Services takes care of it all, with one friendly team and one point of contact.",
  "phone": "09033880869",
  "email": "toludav2015@gmail.com",
  "services": [
    {"name":"Graphics Design","title":"Graphics Design","description":"Posters, banners, cards, social media designs and more — made to help you stand out with stunning designs."},
    {"name":"Web Development","title":"Web Development & Web Apps","description":"Business websites, landing pages and web applications that help you grow your business online."},
    {"name":"Solar & Inverter","title":"Solar & Inverter Consultations","description":"Clean energy solutions for a brighter future — sized properly for your home or business."},
    {"name":"Electrical Installations","title":"Electrical Installations","description":"Professional electrical services that are safe, reliable and neatly finished."}
  ]
}'::jsonb)
on conflict (id) do nothing;
