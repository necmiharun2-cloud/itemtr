# Proje düzeltmeleri kaydı

Bu dosya, yapılan teknik düzeltmelerin özetidir (hata ayıklama, test, tema).

## Tema (dark / aydınlık)

- **Sorun 1:** `ThemeToggle` `localStorage` anahtarı `theme` ve manuel `document.documentElement.classList` kullanıyordu; uygulama ise `next-themes` ile `storageKey="vite-ui-theme"` kullanıyordu. İkisi çakıştığı için sağ üstteki mod geçişi güvenilir çalışmıyordu.
- **Çözüm 1:** `ThemeToggle` `useTheme()` / `setTheme()` ile `next-themes` ile senkronize edildi; ilk render (hydration) için `mounted` kontrolü eklendi. `ThemeProvider`a `attribute="class"` (Tailwind `dark` sınıfı için) ve `enableSystem` eklendi.

- **Sorun 2 (canlı sitede “hiç değişmiyor” hissi):** `src/index.css` içinde **yalnızca `:root`** vardı ve değişkenler **koyu tema** renkleriydi; shadcn/Tailwind düzeninde aydınlık mod **`html` üzerinde `.dark` olmadığında** `:root` paletini kullanır. Aydınlık için ayrı palet tanımlanmadığından düğme `light` seçse bile arayüz koyu kalıyordu.
- **Çözüm 2:** `:root` aydınlık (açık arka plan / koyu metin) CSS değişkenlerine çekildi; önceki koyu değerler **`.dark { ... }`** bloğuna taşındı.

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
