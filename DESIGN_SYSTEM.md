# Subdiu UI Design System — portable spec

Bu dosya, Subdiu'da kullanılan UI sistemini **başka bir projede birebir yeniden üretmek** için yazıldı. Başka bir AI'ya bu dosyayı verip "bu tasarım sistemini kur" dersen, aşağıdaki bilgiler onun için yeterli olmalı.

Öne çıkan özellik: **monokrom/nötr, Apple/Stripe tarzı minimal bir arayüz** — Base UI primitive'leri üzerine kurulu shadcn "base-nova" stili, Tailwind v4, `oklch` renk paleti, ince gölgeler, yumuşak `motion` (Framer Motion) girişleri.

---

## 1) Stack

```json
{
  "dependencies": {
    "@base-ui/react": "^1.6.0",
    "@hookform/resolvers": "^5.4.0",
    "@radix-ui/react-slot": "^1.3.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.4.0",
    "lucide-react": "^1.22.0",
    "motion": "^12.42.2",
    "next": "16.2.9",
    "next-themes": "^0.4.6",
    "react": "19.2.4",
    "react-day-picker": "^10.0.1",
    "react-dom": "19.2.4",
    "react-hook-form": "^7.80.0",
    "recharts": "^3.9.1",
    "shadcn": "^4.12.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.6.0",
    "tw-animate-css": "^1.4.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

**KRİTİK: Bu Radix DEĞİL, Base UI.** shadcn CLI, `components.json`'da `"style": "base-nova"` seçilirse component'leri `@base-ui/react` primitive'leri üzerine üretir (Radix değil). `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide"
}
```

Kurulum: `npx create-next-app@latest` (App Router, TS, Tailwind, `src/` dizini) → `npx shadcn@latest init` → style seçiminde **base-nova** + base color **neutral** seç → gerekli component'leri `npx shadcn@latest add button card dialog form input label select ...` ile ekle.

**Base UI ↔ Radix farkları (başka bir AI bunları bilmeden shadcn/Radix alışkanlıklarıyla kod yazarsa kırılır):**
- `asChild` YOK → her yerde `render={<Button/>}` prop'u kullanılır (Trigger, Close, vb.).
- `Select` native `<select>` gibi davranmaz; `items={[{value,label}]}` prop'u + `value`/`onValueChange` ile controlled kullanılır.
- Compound component'lerin (Menu, RadioGroup, Tabs) alt parçaları (`Menu.GroupLabel`, `RadioItem` vb.) yanlış parent içinde kullanılırsa **runtime'da throw eder** (`tsc`/`build` YAKALAMAZ, sadece tıklayınca patlar). Örn. `DropdownMenuLabel` bir `<Menu.Group>` içinde değilse çöker. Kural: sadece proje içinde zaten kanıtlanmış nesting kalıplarını kopyala, tahmin etme.

---

## 2) Tasarım token'ları — `src/app/globals.css`

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

**Renk felsefesi:** tamamen achromatic (hue=0, chroma=0) nötr gri skala — marka rengi yok, tüm vurgu `primary` (neredeyse siyah/beyaz, dark modda ters döner) üzerinden. Renk sadece durum bildirimi için kullanılır (`destructive` = kırmızımsı, başarı için `emerald-500` gibi Tailwind paletinden ad-hoc sınıflar). `class` tabanlı dark mode (`next-themes`, `attribute="class"`).

---

## 3) Font — `src/app/layout.tsx`

```tsx
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

// <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
```

`next-themes` sarmalayıcı: `attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange`. Toast için `sonner`'ın `<Toaster richColors position="top-center" />`.

---

## 4) `cn()` yardımcı fonksiyonu — `src/lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 5) Çekirdek primitive'ler

### Button — `src/components/ui/button.tsx`

```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
        ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 gap-1.5 px-2.5",
        sm: "h-7 gap-1 px-2.5 text-[0.8rem]",
        lg: "h-9 gap-1.5 px-2.5",
        icon: "size-8",
        "icon-sm": "size-7",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({ className, variant = "default", size = "default", ...props }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
export { Button, buttonVariants }
```

Önemli detay: rounded-lg (`--radius-lg`), border her zaman var (`border-transparent` default'ta bile) — bu, focus ring geçişini pürüzsüz yapıyor. `active:translate-y-px` çok ince bir "bas" hissi veriyor.

### Card — `src/components/ui/card.tsx`

```tsx
function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)]",
        className
      )}
      {...props}
    />
  )
}
// CardHeader: "grid auto-rows-min gap-1 px-(--card-spacing)"
// CardTitle: "font-heading text-base leading-snug font-medium"
// CardDescription: "text-sm text-muted-foreground"
// CardContent: "px-(--card-spacing)"
// CardFooter: "border-t bg-muted/50 p-(--card-spacing) rounded-b-xl"
```

**Kritik incelik: `ring-1 ring-foreground/10` — `border` DEĞİL.** Kartların o "Apple/Stripe" hissi büyük ölçüde bundan geliyor: klasik border yerine çok ince, opaklığı düşük bir ring kullanmak kenarları daha yumuşak/derinlikli gösteriyor.

### Dialog — `src/components/ui/dialog.tsx` (Base UI)

```tsx
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

// Overlay: "fixed inset-0 z-50 bg-black/10 backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
// Popup (=Content): "fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover p-4 ring-1 ring-foreground/10 data-open:zoom-in-95 data-closed:zoom-out-95"
```

Yine `ring-foreground/10` deseni. Arka plan blur'u çok hafif (`backdrop-blur-xs`) + `bg-black/10` — agresif bir karartma yok, dikkat dağıtmıyor.

### Form (react-hook-form + zod köprüsü) — `src/components/ui/form.tsx`

Standart shadcn `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` deseni, `@radix-ui/react-slot`'un `Slot`'u ile (bu tek yerde hâlâ Radix kullanılıyor — sadece slot mekanizması için, UI değil). `FormItem` → `grid gap-2`. Hata mesajı `text-destructive text-sm`.

---

## 6) Motion — giriş animasyonu

`src/components/motion/fade-in.tsx`:

```tsx
"use client"
import { motion, type HTMLMotionProps } from "motion/react"

export function FadeIn({ delay = 0, children, ...props }: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
```

Her sayfa/kart girişinde bu sarmalayıcı kullanılıyor, `delay` ile art arda gelen bloklar kademeli (staggered) giriyor (0, 0.06, 0.1, 0.14…). `ease: [0.22,1,0.36,1]` bir "ease-out-expo"ya yakın — hızlı başlayıp yumuşak biten bir his veriyor, bu his tüm sitede tutarlı.

---

## 7) Auth sayfaları — kullanıcının en beğendiği kısım

**Recipe:** ortalanmış, dar (`max-w-sm`) tek kart, üstte marka logosu, kartın üstünde ince bir radial-gradient "glow", kart içinde OAuth butonları → "veya" ayırıcı → email/şifre formu, kartın altında "hesabın yok mu?" linki. Her şey `FadeIn` ile giriyor.

`src/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-muted)_0%,transparent_70%)]"
      />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
```

`src/app/(auth)/login/page.tsx` (signup birebir aynı iskelet):

```tsx
export default function LoginPage() {
  return (
    <FadeIn>
      <div className="mb-8 flex justify-center">
        <Brand />
      </div>

      <Card className="border-border/60 shadow-xl shadow-black/5">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Tekrar hoş geldin</CardTitle>
          <CardDescription>Aboneliklerini görmek için giriş yap.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <OAuthButtons />
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">veya e-posta ile</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <LoginForm />
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Hesabın yok mu?{" "}
        <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
          Kayıt ol
        </Link>
      </p>
    </FadeIn>
  )
}
```

**Buradaki inceliklerin listesi (kopyalarken atlanmasın):**
- `Card`'a normal `Card` tanımının ÜZERİNE `className="border-border/60 shadow-xl shadow-black/5"` ekleniyor — auth kartı diğer kartlardan biraz daha "kaldırılmış" görünsün diye özel bir gölge katmanı.
- `CardHeader` `text-center` — sadece auth'ta başlıklar ortalı, uygulamanın geri kalanında sol hizalı.
- OAuth butonları `grid grid-cols-2 gap-3`, her biri `variant="outline"`, SVG ikon + marka adı, tıklayınca `Loader2` spinner'a dönüşüyor (aynı buton, ikon yerine spinner).
- "veya" ayırıcı: iki `h-px flex-1 bg-border` çizgi arasında küçük gri metin — hem login hem signup'ta birebir aynı.
- Form: `react-hook-form` + `zodResolver`, submit butonu `w-full`, loading'de `Loader2` ikon + metin aynı buton içinde (yeni buton/overlay değil).
- Marka logosu (`Brand`): `size-8` `bg-primary` `rounded-lg` içinde beyaz bir Lucide ikonu + yanında `font-semibold` metin — kartın 32px üstünde, ortalı.

`Brand`:
```tsx
<div className="flex items-center gap-2.5">
  <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
    <CreditCard className="size-4" />
  </div>
  <span className="text-lg font-semibold tracking-tight">Subdiu</span>
</div>
```

---

## 8) Başka bir AI'ya verilecek hazır prompt

Aşağıdaki bloğu olduğu gibi başka bir projede çalışan bir AI'ya yapıştırabilirsin:

```
Bu projeye aşağıdaki UI tasarım sistemini birebir kur:

1. Next.js App Router + TypeScript + Tailwind v4 kullan. shadcn CLI ile
   `npx shadcn@latest init` çalıştır, style olarak "base-nova" (Radix değil,
   @base-ui/react tabanlı), base color "neutral" seç.
2. Bu depoda ekli DESIGN_SYSTEM.md dosyasındaki globals.css içeriğini,
   font kurulumunu (next/font/google Geist + Geist_Mono) ve cn() yardımcı
   fonksiyonunu birebir kopyala.
3. shadcn'den button, card, dialog, form, input, label, select bileşenlerini
   ekle; DESIGN_SYSTEM.md'deki Button/Card/Dialog kod parçalarındaki özel
   detayları (ring-foreground/10, active:translate-y-px, backdrop-blur-xs)
   koru — bunlar varsayılan shadcn çıktısından FARKLI, elle ince ayar edilmiş.
4. Sayfa/kart girişlerinde src/components/motion/fade-in.tsx'teki FadeIn
   sarmalayıcısını (motion/react, opacity+y girişi, ease [0.22,1,0.36,1])
   kullan, art arda gelen bloklara 0.04-0.06 arası kademeli delay ver.
5. Auth (login/signup) sayfaları için DESIGN_SYSTEM.md §7'deki tam kodu
   birebir uygula: ortalı max-w-sm kart, üstte radial-gradient glow'lu
   layout, üstte marka logosu, OAuth butonları + "veya" ayırıcı + form,
   altta karşı sayfaya link.
6. ÖNEMLİ: Base UI Radix değildir. Trigger/Close gibi yerlerde asChild
   YOK, render={<Button/>} kullanılır. Select native değildir,
   items={[{value,label}]} + onValueChange ile controlled kullanılır.
   Dropdown/Menu/RadioGroup gibi compound component'lerin alt parçalarını
   (GroupLabel, RadioItem vb.) SADECE doğru parent context'i içindeyken
   kullan — yanlış nesting build zamanında değil, kullanıcı tıklayınca
   runtime'da patlar.
```

---

## 9) Referans dosyalar (bu repoda)

- `src/app/globals.css` — tüm token'lar
- `src/components/ui/*` — tüm primitive'ler (button, card, dialog, form, input, label, select, tabs, switch, dropdown-menu, alert-dialog, sheet, popover, calendar, badge, avatar, skeleton, sonner)
- `src/components/motion/fade-in.tsx`
- `src/components/brand.tsx`
- `src/app/(auth)/` — layout + login/signup sayfaları
- `src/components/auth/` — login-form, signup-form, oauth-buttons
