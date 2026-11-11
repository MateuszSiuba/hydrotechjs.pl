# HydroTech J&S

Statyczna strona firmy instalacyjnej z Witnicy: https://hydrotechjs.pl.
Astro 7, TypeScript i Tailwind CSS 4. Środowisko budowania: Node.js 24 LTS (`.nvmrc`, Netlify i GitHub Actions). Projekt zachowuje istniejące adresy artykułów, również wpisu z polskimi znakami w nazwie.

## Praca lokalna

```sh
npm ci
npm run dev
```

Podgląd: http://localhost:4321. Produkcyjny build i weryfikacja:

```sh
npm run check
npm run build
npm run verify
npm run preview
```

`postbuild` generuje `dist/_redirects`: jawne przekierowania dawnych adresów `.html` na adresy bez rozszerzenia oraz regułę 404. Nie zmienia pliku weryfikacyjnego Google. `verify` sprawdza wygenerowane strony, linki, zasoby, warianty zdjęć, canonical, dane strukturalne i mapę witryny.

## Gdzie edytować

- `src/data/company.ts`: numer telefonu, e-mail, adres i obszar działania.
- `src/data/services.ts`: treści usług. Każda pozycja generuje stronę `/uslugi/[slug]`.
- `src/pages/index.astro`: strona główna i trzy najnowsze opublikowane realizacje, wybierane automatycznie według daty.
- `src/content/posts/*.md`: wpisy w kategoriach `realizacje`, `porady`, `pytania`.
- `src/styles/global.css`: wspólny wygląd i reguły mobilne.
- `src/layouts/Layout.astro`: nawigacja, metadane, kontakt mobilny i analityka.

Publikowane są tylko wpisy z `status: published`. `status: draft` wyklucza wpis z generowania podstrony, listy i RSS. Publikacja nie jest planowana automatycznie według daty. Nie zmieniaj nazw istniejących plików wpisów bez dodania przekierowań.

Porównania „przed i po” są przypisane jawnie do wpisów w polu `comparisons`. Każda para zawiera `title`, `format` (`square` lub `portrait`) oraz `before` i `after` z polami `image` i `alt`. Dobieramy zdjęcia tej samej pracy na podstawie materiałów i opisu, bez automatycznego łączenia podobnych plików. Zdjęcia z porównania nie są powtarzane w zwykłej galerii. Na stronie głównej pokazujemy porównanie z wpisu o modernizacji hydroforni.

Zdjęcia realizacji mają gotowe warianty AVIF i WebP: `nazwa-480`, `nazwa-768`, `nazwa-1200`. Komponent `ProjectImage` ustala rzeczywiste wymiary plików i koduje spacje w adresach. Nowe zdjęcia użyte w tym komponencie wymagają kompletu wariantów. Pozostałe obrazy artykułów mogą korzystać z pliku oryginalnego.

Zdjęcia trzech realizacji z czerwca, lipca i września 2026 mają w `public/attachments` opisowe nazwy z datą. Skrypt `scripts/import-2026-project-photos.mjs` przygotowuje je z oryginalnych plików w1–w2, o1–o3 i z1–z4 w katalogu głównym. Nie usuwa oryginałów. Przy hydroforni kolejność porównania została potwierdzona przez właściciela: ciemne rury przed, jasne po — niezależnie od historycznych nazw plików.

Grafika udostępniania: `public/images/og-image.jpg`. Można ją ponownie wygenerować przez `node scripts/generate-social-image.mjs`.

## Kontakt i pomiar

Formularz korzysta z istniejącego endpointu Formspree. Ma walidację, pole przeciw spamowi, blokadę podwójnego wysłania i komunikaty powodzenia/błędu. Weryfikacja builda niczego nie wysyła do Formspree.

GA4 korzysta z dotychczasowego identyfikatora `G-B3JM0G3ZD6`. Uruchamia się po zgodzie. Wybór jest przechowywany przez 365 dni w localStorage; można go zmienić w stopce. Zdarzenia: `click_phone`, `click_email`, `click_whatsapp`, `generate_lead` po pomyślnym wysłaniu formularza. Treść formularza nie jest przesyłana do GA4. Faktyczny odbiór zdarzeń wymaga weryfikacji na koncie GA4.

Mapa Google jest osadzona na stronie głównej i w kontakcie, ładuje się leniwie i ma dodatkowy link do Google Maps. Media społecznościowe są zwykłymi linkami. Strona nie pobiera zdjęć z Unsplash.

## Hosting

Publiczny serwer w czasie audytu wskazywał Netlify. Konfiguracja jest w `netlify.toml`, a katalog publikacji to `dist`. W Netlify należy zachować obsługę Pretty URLs. Repo zawiera także workflow GitHub Pages, uruchamiany przy pushu do `main`; korzysta z Node.js 24 i sprawdza wygenerowane strony przed publikacją. Reguły Netlify `_redirects` nie działają na GitHub Pages.

Przed publikacją na docelowym hostingu należy sprawdzić przekierowania HTTP, wygląd na telefonie i komputerze, odbiór formularza oraz dane w Search Console i GA4. Testy statyczne nie zastępują testów w przeglądarce.

## Weryfikacja odświeżenia — 11 listopada 2026

- Astro check: 0 błędów, 0 ostrzeżeń, 0 wskazówek.
- Build na Node.js 24: 30 stron, w tym 17 wpisów, 7 stron usług i strona 404.
- Kontrola statyczna 30 stron: poprawne metadane, canonical, linki i zasoby lokalne, warianty zdjęć, dane JSON-LD, mapa witryny, obecność telefonu i wygenerowane reguły przekierowań.
- Audyt npm po aktualizacji zależności: 0 zgłoszonych podatności.
- Brak dostępnego hosta przeglądarki uniemożliwił ocenę wizualną i rzeczywiste interakcje mobilne. Nie wysyłano formularza do Formspree. Odbiór wiadomości oraz dane na kontach GA4 i Search Console wymagają osobnej weryfikacji.
