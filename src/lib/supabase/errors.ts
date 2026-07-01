/** Supabase auth hata mesajlarını kullanıcı dostu Türkçe metne çevirir. */
export function mapAuthError(message: string): string {
  const m = message.toLowerCase()

  if (m.includes("invalid login credentials"))
    return "E-posta veya şifre hatalı."
  if (m.includes("email not confirmed"))
    return "Önce e-postanı doğrulaman gerekiyor. Gelen kutunu kontrol et."
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Bu e-posta zaten kayıtlı. Giriş yapmayı dene."
  if (m.includes("password should be at least"))
    return "Şifre çok kısa (en az 6 karakter olmalı)."
  if (m.includes("rate limit") || m.includes("too many"))
    return "Çok fazla deneme yaptın. Lütfen biraz sonra tekrar dene."
  if (m.includes("network") || m.includes("failed to fetch"))
    return "Bağlantı sorunu. İnternet bağlantını kontrol et."

  return message
}
