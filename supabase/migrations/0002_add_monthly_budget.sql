-- Kullanıcının opsiyonel aylık bütçe limiti (dashboard'daki aşım uyarısı için).
-- Supabase SQL Editor'da çalıştır.
alter table public.profiles add column if not exists monthly_budget numeric(12, 2);
