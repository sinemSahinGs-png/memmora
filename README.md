# Memoora

NFC ile açılan premium dijital hatıra ağacı. **1 katkı = 1 yaprak.**

## Kurulum

```bash
npm install
cp .env.local.example .env.local
# .env.local içine Supabase URL ve anon key ekleyin
npm run dev
```

- Ana sayfa: http://localhost:3000
- Çift dünyası: http://localhost:3000/mert-irem
- Admin: http://localhost:3000/mert-irem/admin (PIN: `.env.local` → `NEXT_PUBLIC_ADMIN_PIN`)

## Supabase

1. [Supabase](https://supabase.com) projesi oluşturun
2. SQL Editor'da `supabase/schema.sql` dosyasını çalıştırın
3. Storage → **memories** bucket oluşturun (public)
4. Storage policies bölümündeki yorum satırlarını schema.sql sonundan aktifleştirin
5. `.env.local` değişkenlerini doldurun

### Tablolar

- `couples` — çift bilgisi
- `contributions` — 1 kayıt = 1 yaprak
- `contribution_media` — yaprağa eklenen foto/video

### Güvenlik notu

MVP admin paneli client-side PIN kullanır. **Production'da** admin silme ve hassas işlemler server-side auth (service role + API route) ile korunmalıdır.

## Ürün mantığı

- Misafir mesaj bırakır (+ opsiyonel medya)
- Her gönderim = 1 yaprak
- Medya ayrı yaprak sayılmaz
- Mesajlar direkt görünür (kilit yok)
- Ağaç max 250 yaprakta tam gelişim
