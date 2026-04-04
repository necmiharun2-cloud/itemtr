# Proje düzeltmeleri kaydı

Bu dosya, yapılan teknik düzeltmelerin özetidir (hata ayıklama, test, tema).

## Tema (dark / aydınlık)

- **Sorun:** `ThemeToggle` `localStorage` anahtarı `theme` ve manuel `document.documentElement.classList` kullanıyordu; uygulama ise `next-themes` ile `storageKey="vite-ui-theme"` kullanıyordu. İkisi çakıştığı için sağ üstteki mod geçişi güvenilir çalışmıyordu.
- **Çözüm:** `ThemeToggle` `useTheme()` / `setTheme()` ile `next-themes` ile senkronize edildi; ilk render (hydration) için `mounted` kontrolü eklendi. `ThemeProvider`a `attribute="class"` (Tailwind `dark` sınıfı için) ve `enableSystem` eklendi.

## Vitest / bellek

- `vitest.config.ts`: tek fork, sıralı dosya çalıştırma, düşük eşzamanlılık ile bellek kullanımı azaltıldı.
- `package.json` `test` script: Node `--max-old-space-size=8192` ile heap OOM riski azaltıldı.
- `comprehensive.test.tsx`: kullanılmayan ağır sayfa importları kaldırıldı; `Header` için `messaging` / `notifications` kısmi mock ve React Router `future` bayrakları eklendi.

## ESLint (react-hooks)

- `Admin.tsx` / `Dashboard.tsx`: `useEffect` bağımlılık dizisine `navigate` eklendi.
- `Messages.tsx`: `syncConversations` `useCallback` ile sarıldı; `useEffect` bağımlılığı düzeltildi.

## Tailwind uyarıları (build)

- `HomeSlider.tsx`: belirsiz `duration-[2000ms]` → `duration-[2s]`; `ease-[...]` → `[transition-timing-function:...]`.

## React Router

- `App.tsx` ve testlerdeki `BrowserRouter` / `MemoryRouter`: `v7_startTransition` ve `v7_relativeSplatPath` future bayrakları eklendi (uyarıların giderilmesi).

---

*Son güncelleme: tema düzeltmesi ve bu kayıt dosyası eklendi.*
