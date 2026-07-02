-- Yeni kullanıcılar için varsayılan para birimini TRY yap.
-- Supabase SQL Editor'da çalıştır (canlı DB için gerekli — schema.sql'i yeniden
-- çalıştırmadıysan mevcut tabloda hâlâ eski 'USD' varsayılanı geçerlidir).
alter table public.profiles alter column default_currency set default 'TRY';

-- (İsteğe bağlı) Henüz değiştirmemiş, USD'de kalan hesapları TRY'ye çek.
-- Bilinçli olarak USD seçenler etkilenmesin istiyorsan bu satırı çalıştırma.
-- update public.profiles set default_currency = 'TRY' where default_currency = 'USD';
