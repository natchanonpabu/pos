---
name: i18n-setup
description: Setup internationalization (i18n) for React/Next.js projects using next-intl, react-i18next, or react-intl. Generate translation files, locale routing, language switchers, and RTL support. Use when adding multi-language support, creating translation files, setting up locale routing, or when user mentions "i18n", "internationalization", "translation", "multi-language", "locale", "language switcher", or needs to support multiple languages.
---

# Internationalization (i18n) Setup Skill

Setup complete internationalization support for React/Next.js applications. Handles translation files, locale routing, language switching, and RTL support.

## When to Use This Skill

- Adding multi-language support to application
- Setting up translation system
- Creating language switcher component
- Configuring locale-based routing
- Generating translation files
- Adding RTL (Right-to-Left) support
- Managing translation keys
- Setting up pluralization

## Initial Setup: Detect Project Type

### Step 1: Detect Framework

Check for:
- **Next.js App Router**: `app` directory with layout.tsx
- **Next.js Pages Router**: `pages` directory
- **React (Vite/CRA)**: Standard React app
- **Remix**: app/routes structure

### Step 2: Detect Existing i18n Library

Check `package.json` for:
- **next-intl**: `next-intl` (Next.js specific, recommended)
- **react-i18next**: `react-i18next` + `i18next`
- **react-intl**: `react-intl` (Format.js)
- **None**: Need to choose and install

### Step 3: Detect Project Structure

Look for:
- Translation files location (`locales/`, `translations/`, `messages/`)
- Supported languages
- Current locale management
- Routing strategy

### Step 4: Document Setup

```
i18n setup detected:
- Framework: Next.js 15 App Router
- Library: next-intl
- Locales: en, th, ja
- Default: en
- Routing: Locale prefix (/en/, /th/)
- Translations: src/locales/{locale}/
```

## Next.js + next-intl Pattern (Recommended)

### Installation

```bash
npm install next-intl
```

### Project Structure

```
src/
├── app/
│   └── [locale]/
│       ├── layout.tsx
│       ├── page.tsx
│       └── about/
│           └── page.tsx
├── i18n/
│   ├── routing.ts
│   └── request.ts
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   └── errors.json
│   ├── th/
│   │   ├── common.json
│   │   ├── auth.json
│   │   └── errors.json
│   └── ja/
│       ├── common.json
│       ├── auth.json
│       └── errors.json
└── middleware.ts
```

### Configuration

**i18n/routing.ts**:
```typescript
import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // Supported locales
  locales: ['en', 'th', 'ja'],
  
  // Default locale
  defaultLocale: 'en',
  
  // Locale prefix strategy
  localePrefix: 'always', // or 'as-needed', 'never'
  
  // Locale detection
  localeDetection: true,
})

// Navigation utilities with i18n
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
```

**i18n/request.ts**:
```typescript
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from request or use default
  let locale = await requestLocale

  // Ensure valid locale
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`@/locales/${locale}/common.json`)).default,
  }
})
```

**middleware.ts**:
```typescript
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

### Root Layout

**app/[locale]/layout.tsx**:
```typescript
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Ensure valid locale
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  // Load all messages for locale
  const messages = await getMessages()

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### Translation Files

**locales/en/common.json**:
```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "welcome": "Welcome, {name}!",
  "items": {
    "zero": "No items",
    "one": "One item",
    "other": "{count} items"
  },
  "lastUpdated": "Last updated: {date, date, medium}"
}
```

**locales/th/common.json**:
```json
{
  "nav": {
    "home": "หน้าแรก",
    "about": "เกี่ยวกับ",
    "contact": "ติดต่อ"
  },
  "welcome": "ยินดีต้อนรับ, {name}!",
  "items": {
    "zero": "ไม่มีรายการ",
    "one": "1 รายการ",
    "other": "{count} รายการ"
  },
  "lastUpdated": "อัปเดตล่าสุด: {date, date, medium}"
}
```

### Using Translations

**Server Component**:
```typescript
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('common')

  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{t('welcome', { name: 'John' })}</p>
      <p>{t('items', { count: 5 })}</p>
    </div>
  )
}
```

**Client Component**:
```typescript
'use client'

import { useTranslations } from 'next-intl'

export function ClientComponent() {
  const t = useTranslations('common')

  return <button>{t('nav.contact')}</button>
}
```

### Language Switcher

**components/language-switcher.tsx**:
```typescript
'use client'

import { useParams, usePathname } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { routing } from '@/i18n/routing'

const languages = {
  en: { name: 'English', flag: '🇬🇧' },
  th: { name: 'ไทย', flag: '🇹🇭' },
  ja: { name: '日本語', flag: '🇯🇵' },
}

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <select
      value={params.locale as string}
      onChange={(e) => handleChange(e.target.value)}
    >
      {routing.locales.map((locale) => (
        <option key={locale} value={locale}>
          {languages[locale as keyof typeof languages].flag}{' '}
          {languages[locale as keyof typeof languages].name}
        </option>
      ))}
    </select>
  )
}
```

## React + react-i18next Pattern

### Installation

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

### Configuration

**i18n/config.ts**:
```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations
import enCommon from '@/locales/en/common.json'
import thCommon from '@/locales/th/common.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      th: { common: thCommon },
    },
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
```

**main.tsx/App.tsx**:
```typescript
import '@/i18n/config'

function App() {
  return <div>{/* Your app */}</div>
}
```

### Using Translations

```typescript
import { useTranslation } from 'react-i18next'

export function Component() {
  const { t, i18n } = useTranslation('common')

  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <button onClick={() => i18n.changeLanguage('th')}>
        Switch to Thai
      </button>
    </div>
  )
}
```

## Advanced Patterns

### Namespace Organization

Organize translations by feature:

```
locales/
├── en/
│   ├── common.json      # Shared translations
│   ├── auth.json        # Authentication
│   ├── dashboard.json   # Dashboard
│   ├── errors.json      # Error messages
│   └── validation.json  # Form validation
```

**Usage with namespace**:
```typescript
// Load specific namespace
const t = useTranslations('auth')

// Use
t('login.title') // → "Login"
t('login.button') // → "Sign In"
```

### Pluralization

**Translation file**:
```json
{
  "items": {
    "zero": "No items",
    "one": "One item",
    "other": "{count} items"
  }
}
```

**Usage**:
```typescript
t('items', { count: 0 }) // "No items"
t('items', { count: 1 }) // "One item"
t('items', { count: 5 }) // "5 items"
```

### Date & Time Formatting

```typescript
import { useFormatter } from 'next-intl'

export function DateComponent() {
  const format = useFormatter()
  const date = new Date()

  return (
    <div>
      {/* Different formats */}
      <p>{format.dateTime(date, 'short')}</p>
      <p>{format.dateTime(date, 'medium')}</p>
      <p>{format.dateTime(date, 'long')}</p>
      
      {/* Custom format */}
      <p>{format.dateTime(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</p>
      
      {/* Relative time */}
      <p>{format.relativeTime(date)}</p>
    </div>
  )
}
```

### Number Formatting

```typescript
const format = useFormatter()

format.number(1234.56) // "1,234.56"
format.number(1234.56, { style: 'currency', currency: 'USD' }) // "$1,234.56"
format.number(0.5, { style: 'percent' }) // "50%"
```

### Rich Text (HTML in translations)

**Translation**:
```json
{
  "terms": "I agree to the <link>terms and conditions</link>"
}
```

**Usage**:
```typescript
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function Component() {
  const t = useTranslations()

  return (
    <p>
      {t.rich('terms', {
        link: (chunks) => <Link href="/terms">{chunks}</Link>
      })}
    </p>
  )
}
```

### RTL (Right-to-Left) Support

**Layout adaptation**:
```typescript
export default async function LocaleLayout({ params }: Props) {
  const { locale } = await params
  const direction = locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={direction}>
      <body className={direction === 'rtl' ? 'rtl' : 'ltr'}>
        {children}
      </body>
    </html>
  )
}
```

**CSS for RTL**:
```css
/* Use logical properties */
.element {
  margin-inline-start: 1rem; /* margin-left in LTR, margin-right in RTL */
  margin-inline-end: 1rem;
  padding-inline: 1rem;
}

/* RTL-specific styles */
[dir="rtl"] .element {
  transform: scaleX(-1); /* Flip horizontally */
}
```

### Type-Safe Translations

**Generate types from translations**:

```typescript
// scripts/generate-translation-types.ts
import fs from 'fs'

const enTranslations = JSON.parse(
  fs.readFileSync('locales/en/common.json', 'utf-8')
)

type TranslationKeys = {
  [K in keyof typeof enTranslations]: typeof enTranslations[K] extends object
    ? `${K & string}.${keyof typeof enTranslations[K] & string}`
    : K
}[keyof typeof enTranslations]

// Export type
fs.writeFileSync(
  'src/types/i18n.ts',
  `export type TranslationKey = ${JSON.stringify(Object.keys(enTranslations))}`
)
```

**Usage**:
```typescript
import { type TranslationKey } from '@/types/i18n'

function t(key: TranslationKey) {
  // Type-safe translation key
}
```

### Loading Translations Dynamically

**Split by page**:
```typescript
// Load only needed translations
export default async function Page({ params }: Props) {
  const { locale } = await params
  
  const [common, dashboard] = await Promise.all([
    import(`@/locales/${locale}/common.json`),
    import(`@/locales/${locale}/dashboard.json`),
  ])

  return (
    <NextIntlClientProvider messages={{ ...common, ...dashboard }}>
      {/* Page content */}
    </NextIntlClientProvider>
  )
}
```

## Translation Management

### Missing Translations

**Development mode helper**:
```typescript
// i18n/config.ts
i18n.init({
  // ...
  saveMissing: true,
  missingKeyHandler: (lng, ns, key) => {
    console.warn(`Missing translation: ${lng}.${ns}.${key}`)
  },
})
```

### Translation Keys Structure

Good structure:
```json
{
  "feature": {
    "component": {
      "action": "Text"
    }
  }
}
```

Example:
```json
{
  "auth": {
    "login": {
      "title": "Sign In",
      "email": "Email Address",
      "password": "Password",
      "submit": "Sign In",
      "forgot": "Forgot Password?"
    }
  }
}
```

### Translation Workflow

1. **Extract keys**: Find all t() calls in code
2. **Add to en**: Add English text (base language)
3. **Translate**: Send to translators for other languages
4. **Review**: Check translations in context
5. **Deploy**: Include in build

## Best Practices

1. **Use namespaces**: Organize by feature/page
2. **Consistent keys**: Use dot notation (auth.login.title)
3. **Avoid concatenation**: Use interpolation instead
4. **Handle plurals**: Use plural forms, not manual logic
5. **Format dates/numbers**: Use formatters, not manual
6. **Type safety**: Generate types from translations
7. **RTL support**: Use logical CSS properties
8. **Load smartly**: Split translations per route
9. **Missing keys**: Log and handle gracefully
10. **Test**: Test all supported languages

## Common Patterns

### Language Dropdown (Enhanced)

```typescript
'use client'

import { Menu } from '@headlessui/react'
import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
]

export function LanguageDropdown() {
  const router = useRouter()
  const params = useParams()
  const currentLocale = params.locale as string

  const currentLang = languages.find((l) => l.code === currentLocale)

  return (
    <Menu as="div" className="relative">
      <Menu.Button>
        {currentLang?.flag} {currentLang?.name}
      </Menu.Button>
      <Menu.Items>
        {languages.map((lang) => (
          <Menu.Item key={lang.code}>
            {({ active }) => (
              <button
                onClick={() => router.replace('/', { locale: lang.code })}
                className={active ? 'bg-blue-500' : ''}
              >
                {lang.flag} {lang.name}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  )
}
```

### SEO with i18n

```typescript
import { type Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      languages: {
        en: '/en',
        th: '/th',
        ja: '/ja',
      },
    },
  }
}
```

## Tips for Success

- Start with English as base language
- Use clear, hierarchical key structure
- Test with long translations (German, Finnish)
- Test RTL languages if supporting them
- Use formatters for dates/numbers/currency
- Avoid hardcoded strings
- Plan for plural forms
- Consider context (formal vs informal)
- Use translation management tools for scale
- Keep translators in loop early

Remember: Good i18n is invisible to users—it just works naturally in their language.
