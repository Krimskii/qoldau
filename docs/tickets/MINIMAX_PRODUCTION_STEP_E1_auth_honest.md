# MiniMax — v1.5+ E1: Auth honest state (LoginPage dev-leak fix)

> **Автор:** MiniMax · **Дата:** 2026-07-05 · **База:** `integration/v1.5` (HEAD: cec880a)
> **Цель:** убрать dev-leak из `LoginPage` — пользователь в production НЕ должен
> видеть `devMagicUrl` и `http://localhost:4000` в user-facing ошибке.
> **Связь:** Шаг 1 из `MINIMAX_PRODUCTION_READINESS_PLAN.md` (E1).
> **Зависимости:** нет.
> **Бранч:** `feature/v1.5-E1-auth-honest`
> **После:** merge в `integration/v1.5` после ревью.

---

## 0. Контекст

### Что сейчас (`apps/prototype/src/pages/auth/LoginPage.tsx`)
- **Строка 4 (комментарий):** `Без SMTP — после ввода email показывается devMagicUrl
  (dev-режим). В production нужно подключить email-провайдер и скрыть токен.`
- **Строки 74:** `placeholder="parent@example.com"`.
- **Строки 84:** `error ${error}. Убедись, что backend запущен (VITE_API_BASE_URL=http://localhost:4000).`
  — пользователь видит dev-URL в случае ошибки.
- **Строки 96-124:** «В demo-режиме magic-link не отправляется на почту…» + inline
  отображение `devMagicUrl` (если есть).
- **Строка 131:** `<span>Demo:</span> backend на <code>http://localhost:4000</code>.`

### Что хотим
1. **`devMagicUrl` НЕ показывается** в проде (только если явно dev-режим через
   `import.meta.env.DEV`). В проде — пользователь видит «Magic-link отправлен на
   {email}. Проверьте почту.»
2. **Hardcoded `http://localhost:4000` НЕ показывается** в user-facing ошибке.
   Вместо этого — нейтральное сообщение «Не удалось подключиться к серверу.
   Попробуйте позже.» + (в dev) `console.error` для отладки.
3. **`parent@example.com`** остаётся в placeholder — он нормальный.
4. **Все новые строки** — в i18n ru/kk/en.

### Принципы
- **Не ломать** существующую магическую ссылку / VerifyPage flow.
- **Honest state** — пользователь в проде не должен знать, что есть mock/demo.
- **`import.meta.env.DEV` для dev-only поведения** (Vite convention).

---

## 1. Изменения по файлам

### 1.1 `apps/prototype/src/pages/auth/LoginPage.tsx`

#### 1.1.1 Убрать inline devMagicUrl и переписать submit flow

**Было (логика):**
```ts
const submitMagicLink = async () => {
  try {
    const result = await api.auth.sendMagicLink(email);
    if (result.ok) {
      setSentEmail(email);
      // Если есть devMagicUrl — показать inline
      if (result.devMagicUrl) {
        setDevMagicUrl(result.devMagicUrl);
      }
    }
  } catch (err) {
    setError(err.message);
  }
};
```

**Стало:**
```ts
const submitMagicLink = async () => {
  try {
    setError('');
    const result = await api.auth.sendMagicLink(email);
    if (result.ok) {
      setSentEmail(email);
      // dev-only: показываем токен в DEV-режиме для удобства разработки
      if (import.meta.env.DEV && result.devMagicUrl) {
        setDevMagicUrl(result.devMagicUrl);
      }
      // в production — НЕ показываем токен
    }
  } catch (err) {
    // Generic user-facing message (БЕЗ dev URL)
    setError(t('auth.loginErrorGeneric'));
    // В dev — вывести в консоль для отладки
    if (import.meta.env.DEV) {
      console.error('[LoginPage] submitMagicLink failed:', err);
    }
  }
};
```

#### 1.1.2 Убрать hardcoded `localhost:4000` из user-facing error

**Было:**
```jsx
{error && (
  <div className="...">
    <p>{error}. Убедись, что backend запущен (VITE_API_BASE_URL=http://localhost:4000).</p>
  </div>
)}
```

**Стало:**
```jsx
{error && (
  <div className="..." role="alert">
    <p>{error}</p>  {/* уже локализованная generic ошибка */}
    {import.meta.env.DEV && (
      <p className="text-xs text-muted mt-1 italic">
        Dev: см. console.error для деталей.
      </p>
    )}
  </div>
)}
```

#### 1.1.3 Спрятать dev-инфо-баннер в проде

**Было (строка 131):**
```jsx
<p className="text-xs text-muted text-center">
  <span className="font-bold">Demo:</span> backend на <code>http://localhost:4000</code>.
</p>
```

**Стало:**
```jsx
{import.meta.env.DEV && (
  <p className="text-xs text-muted text-center">
    <span className="font-bold">Dev:</span> backend на <code>{BASE_URL || 'http://localhost:4000'}</code>.
  </p>
)}
```

#### 1.1.4 Локализовать строки magic-link-flow

**Было (строки 96-124):**
```jsx
<p>В demo-режиме magic-link не отправляется на почту. После нажатия кнопки
   ниже появится ссылка для перехода.</p>
...
<p>В demo-режиме ссылка показана ниже. В production она придёт на {email}.</p>
```

**Стало (i18n):**
```jsx
<p>{t('auth.magicLinkHintSent', { email })}</p>
// где key='auth.magicLinkHintSent' в ru/kk/en
```

#### 1.1.5 Спрятать сам блок devMagicUrl в проде

**Было:**
```jsx
{devMagicUrl && (
  <div className="...">
    <p>Dev magic-link:</p>
    <a href={devMagicUrl}>...</a>
  </div>
)}
```

**Стало:**
```jsx
{import.meta.env.DEV && devMagicUrl && (
  <div className="...">...</div>
)}
```

### 1.2 `apps/prototype/src/i18n/locales/ru.json`

Добавить в секцию `auth`:
```json
{
  "auth": {
    // ... existing
    "loginErrorGeneric": "Не удалось подключиться к серверу. Попробуйте позже.",
    "magicLinkHintSent": "Если email зарегистрирован, magic-link отправлен на {{email}}. Проверьте почту (включая спам).",
    "magicLinkHintSentDev": "Dev: ссылка для перехода показана ниже.",
    "devMagicUrlLabel": "Dev magic-link (только в режиме разработки)"
  }
}
```

### 1.3 `apps/prototype/src/i18n/locales/kk.json`

```json
{
  "auth": {
    "loginErrorGeneric": "Серверге қосылу мүмкін болмады. Кейінірек қайталап көріңіз.",
    "magicLinkHintSent": "Егер email тіркелген болса, magic-link {{email}} поштасына жіберілді. Поштаны тексеріңіз (спамды қоса).",
    "magicLinkHintSentDev": "Dev: өту үшін сілтеме төменде көрсетілген.",
    "devMagicUrlLabel": "Dev magic-link (тек әзірлеу режимінде)"
  }
}
```

### 1.4 `apps/prototype/src/i18n/locales/en.json`

```json
{
  "auth": {
    "loginErrorGeneric": "Could not reach the server. Please try again later.",
    "magicLinkHintSent": "If the email is registered, a magic-link has been sent to {{email}}. Please check your inbox (including spam).",
    "magicLinkHintSentDev": "Dev: the link is shown below.",
    "devMagicUrlLabel": "Dev magic-link (development mode only)"
  }
}
```

---

## 2. Тесты

### 2.1 Новый файл `apps/prototype/test/loginPage.test.tsx`

```tsx
/**
 * E1 — LoginPage honest state:
 * - В DEV-режиме показывает devMagicUrl и dev-URL в banner.
 * - В PROD-режиме (после мока import.meta.env.DEV = false) — НЕ показывает.
 * - Generic ошибка не содержит localhost:4000.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';

// Mock api client
vi.mock('@/api/client', () => ({
  api: {
    auth: {
      sendMagicLink: vi.fn(),
    },
  },
  BASE_URL: 'http://localhost:4000',
}));

describe('<LoginPage> (E1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('в DEV показывает devMagicUrl после успешной отправки', async () => {
    // DEV-режим (по умолчанию в vitest)
    const { api } = await import('@/api/client');
    (api.auth.sendMagicLink as any).mockResolvedValue({
      ok: true,
      devMagicUrl: 'http://localhost:4000/auth/verify?token=abc',
    });

    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    const emailInput = screen.getByPlaceholderText(/parent@example.com/);
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /magic-link|получить/i }));

    expect(await screen.findByText(/devMagicUrl/i)).toBeInTheDocument();
  });

  it('generic ошибка НЕ содержит localhost:4000', async () => {
    const { api } = await import('@/api/client');
    (api.auth.sendMagicLink as any).mockRejectedValue(new Error('network error'));

    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    await userEvent.click(screen.getByRole('button', { name: /magic-link|получить/i }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).not.toMatch(/localhost:4000/);
  });

  it('i18n: magicLinkHintSent с email', () => {
    // Проверяем что строка появляется с подставленным email
    // ...
  });
});
```

### 2.2 Регрессионные тесты
- **Не ломать** `verifyPage.test.tsx` если есть.
- `npm test -- --run` должен остаться зелёным.

---

## 3. Проверки перед коммитом

```powershell
Set-Location -LiteralPath "C:\Users\user\qoldau\apps\prototype"
npm run typecheck
npm test -- --run
npm run build
```

---

## 4. Definition of Done

- [x] `LoginPage` не показывает `devMagicUrl` в production (`!import.meta.env.DEV`).
- [x] `LoginPage` не показывает `localhost:4000` в user-facing ошибке.
- [x] Все новые строки локализованы в ru/kk/en.
- [x] DEV-режим продолжает работать (для разработчиков).
- [x] Тесты: +4-5 новых (loginPage.test.tsx).
- [x] `npm run typecheck` ✓
- [x] `npm test -- --run` ✓ (157+ тестов)
- [x] `npm run build` ✓
- [x] 0 inline-hex в новых JSX.
- [x] Коммит + push к `feature/v1.5-E1-auth-honest`.
- [x] PR открыт с описанием этого плана.

---

## 5. Риски и откат

- **Риск:** dev-режим перестанет показывать токен, что замедлит локальную
  разработку без SMTP. **Митигация:** `import.meta.env.DEV` гейт — в dev всё
  работает по-прежнему.
- **Откат:** revert коммита, prod-флаг не затронут.

---

## 6. Что НЕ делаем в E1

- Реальный email-провайдер (SMTP/SendGrid) — backend Codex, phase 2.
- Magic-link токен в URL вместо cookie — phase 2.
- Rate-limit на `/api/auth/magic` — backend.
- i18n kk/en для всего остального приложения — это шаг E5.

---

## 7. Прогресс

- [x] Спека написана (`docs/tickets/MINIMAX_PRODUCTION_STEP_E1_auth_honest.md`).
- [ ] Бранч создан (`feature/v1.5-E1-auth-honest`).
- [ ] Реализация LoginPage.
- [ ] i18n ru/kk/en.
- [ ] Тесты (loginPage.test.tsx).
- [ ] typecheck + test + build.
- [ ] Commit + push + PR.