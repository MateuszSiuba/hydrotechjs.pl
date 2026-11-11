# HydroTech J&S — audyt i plan odświeżenia

Data: 11 listopada 2026. Zakres: publiczna strona https://hydrotechjs.pl oraz lokalny projekt Astro. Nowe materiały blogowe pozostają na ostatni etap.

Ten dokument opisuje stan przed odświeżeniem. Implementacja nowej wersji znajduje się w projekcie, a informacje o jej uruchamianiu i sprawdzaniu są w README.md.

## Wniosek

Warto rozwijać obecny projekt. Ma statyczne renderowanie Astro, własną domenę, istniejące adresy wpisów i zdjęcia realizacji. Najpierw trzeba uporządkować techniczne SEO i wiarygodność informacji, następnie przebudować prezentację oferty oraz kontakt. Samo odświeżenie kolorów nie rozwiąże tych problemów.

## Co sprawdzono

- Wszystkie 18 adresów z produkcyjnej mapy witryny zwraca HTTP 200; każdy ma jeden H1.
- Sprawdzono 38 unikalnych lokalnych adresów obrazów w znacznikach img tych stron: wszystkie zwracają HTTP 200. Nie jest to test wszystkich plików, srcset, filmów ani zasobów zewnętrznych.
- HTTP i www prowadzą do https://hydrotechjs.pl/.
- robots.txt i obie mapy XML działają. Robots nie blokuje indeksowania.
- Nieistniejący adres zwraca HTTP 404.
- Lokalny `npm run build` kończy się powodzeniem: 19 stron, w tym strona błędu.
- Produkcja zgłasza serwer Netlify. Repozytorium zawiera także workflow GitHub Pages; przed wdrożeniem trzeba ustalić faktycznie używany proces publikacji.

## Priorytet 1 — poprawki techniczne i spójność informacji

| Ustalenie | Dowód / miejsce | Proponowana zmiana |
| --- | --- | --- |
| Niespójne adresy kanoniczne | `/blog`, `/kontakt`, `/uslugi`, `/polityka-prywatnosci` wskazują canonical z `.html`, mapa i menu używają adresów bez rozszerzenia. Warianty `/blog.html`, `/kontakt.html`, `/uslugi.html` również zwracają 200 bez przekierowania. | Wybrać adresy bez rozszerzenia, ujednolicić canonical, mapę, linki i przekierowania Netlify. Zachować obecne adresy wpisów. |
| Brak domyślnej grafiki udostępniania | `/images/og-image.jpg` zwraca 404; Layout używa jej w Open Graph, Twitter i danych firmy. | Dodać prawdziwą grafikę marki / realizacji, sprawdzić podglądy linków. |
| Sprzeczne obietnice dojazdu | Strona główna: „do 30 minut”, „od 30 minut”, a niżej „w ciągu 2h”. | Ustalić realną deklarację i warunki dojazdu. |
| Niejednoznaczny obszar obsługi | Promień 50 km oraz równocześnie całe województwo; deklaracja dojazdu gratis. | Potwierdzić rzeczywisty zakres i zasady wyceny. |
| Opinie i ocena są statyczne | `src/pages/index.astro` zawiera 4 cytaty z tekstami „5 miesięcy temu” itd.; Layout zawiera stałe 5.0 i 4 opinie. | Zweryfikować cytaty i aktualną ocenę w profilu firmy; stosować daty bezwzględne lub opis z datą aktualizacji. Nie traktować tego jako synchronizacji z Google. |
| Generowanie szkiców wpisów | `getStaticPaths()` w `src/pages/posts/[slug].astro` pobiera wszystkie wpisy, mimo że listing i RSS filtrują status published. | Wykluczyć draft z generowania stron. Obecne 13 wpisów ma status published, więc to zabezpieczenie przyszłego procesu publikacji. |
| Niepoprawna odpowiedź FAQ w danych strukturalnych | Dla kategorii pytania `acceptedAnswer.text` pochodzi z opisu, który bywa pytaniem użytkownika. | Przekazywać rzeczywistą odpowiedź zgodną z widoczną treścią albo usunąć ten schemat. |
| Pozorna obsługa wyszukiwania w schemacie | SearchAction wskazuje `/blog` bez parametru zapytania; filtr działa lokalnie w JS. | Usunąć zbędną deklarację lub wdrożyć zgodny mechanizm. |

Oceny własnej firmy oznaczone jako LocalBusiness/Plumber nie dają podstaw do oczekiwania gwiazdek w organicznych wynikach Google. Nie jest to samo w sobie dowód kary. Źródło: https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful

## Priorytet 2 — oferta, wygląd i zapytania od klientów

Proponowany kierunek: czytelna strona lokalnej firmy instalacyjnej, z prawdziwymi zdjęciami i prostym kontaktem. Obecny kod używa tego samego zdjęcia z Unsplash w nagłówkach głównej strony, usług, bloga i kontaktu. Własne realizacje lepiej pokażą rzeczywisty zakres prac.

Proponowana kolejność sekcji strony głównej:

1. Konkretne otwarcie: „Hydraulik w Witnicy i okolicach” oraz krótki opis najważniejszych usług. Główny przycisk „Zadzwoń 502 313 419”, drugi „Zobacz realizacje”. Dziś główne przyciski prowadzą do usług i kontaktu.
2. Najważniejsze usługi, każda z własnym adresem i zdjęciem lub prostą ikoną.
3. Wybrane istniejące realizacje: problem, wykonane prace, efekt i lokalizacja, jeśli można ją opublikować.
4. Informacje o firmie: kto wykonuje prace, doświadczenie i uprawnienia wyłącznie po potwierdzeniu.
5. Zweryfikowane opinie ze wskazaniem źródła.
6. Jak wygląda zgłoszenie i wycena; jasny obszar działania.
7. Kontakt i odpowiedzi na pytania klientów.

Należy ograniczyć liczbę konkurujących ozdobników, gradientów i powtarzalnych kart. Zachować niebieską identyfikację, poprawić kontrast drobnych tekstów i widoczność telefonu. To propozycja na podstawie kodu; finalna ocena wizualna wymaga przeglądarki.

Kontakt: uprościć formularz pod realny sposób pracy firmy; rozważyć opcjonalny e-mail przy wymaganym telefonie, jeśli firma głównie oddzwania. Dodać miejscowość i rodzaj usługi, informację o przetwarzaniu danych oraz czytelne komunikaty stanu. Link „Messenger” prowadzi obecnie do profilu Facebook, nie bezpośrednio do rozmowy. Nie wysyłano zgłoszeń testowych.

## Priorytet 3 — lokalne SEO

Oferta ma sześć grup na jednej podstronie. Proponowane osobne, merytoryczne strony:

- `/uslugi/instalacje-wodno-kanalizacyjne`
- `/uslugi/ogrzewanie-podlogowe`
- `/uslugi/kotlownie` — z podziałem na faktycznie oferowane technologie
- `/uslugi/uzdatnianie-wody`
- `/uslugi/hydrofornie-i-pompy`
- `/uslugi/nawadnianie-ogrodow`
- `/uslugi/awarie-hydrauliczne` — jeśli dyżur i zakres są potwierdzone

Każda powinna opisywać zakres prac, sytuacje klienta, proces wyceny, obszar obsługi i odpowiadające jej realizacje. Linki powinny prowadzić w obie strony: oferta → realizacja oraz realizacja → oferta.

Witnica jest naturalnym punktem wyjścia. Kolejne miasta wybierać na podstawie rzeczywistych zleceń i danych Search Console. Nie tworzyć seryjnych kopii podstron z podmienioną nazwą miasta. Nie ustalono wolumenu wyszukiwania ani obecnych pozycji.

Równolegle sprawdzić profil Google firmy: kategorię, zakres usług, dane kontaktowe, obszar działania, godziny, zdjęcia i opinie. Aktualne dane i opinie mają znaczenie dla widoczności lokalnej; Google wskazuje trafność, odległość i rozpoznawalność jako główne grupy czynników. Źródło: https://support.google.com/business/answer/7091?hl=pl

## Pomiar i działanie

W kodzie jest identyfikator GA4 oraz ładowanie analityki po akceptacji. Samo istnienie kodu nie potwierdza, że dane docierają do właściwego konta.

- Zweryfikować GA4 i Search Console. Plik weryfikacyjny Google w repo nie potwierdza aktualnego dostępu ani stanu indeksowania.
- Mierzyć kliknięcia telefonu, WhatsApp, e-maila oraz poprawne wysłanie formularza. Kliknięcie telefonu nie jest dowodem odbytej rozmowy.
- Sprawdzić duplikowanie page_view: kod ma konfigurację gtag i ręczne zdarzenia przy nawigacji Astro.
- Przetestować ponowne przejścia między stronami: formularz, baner cookies i przewijanie do góry mają odwołania pobierane jednokrotnie, mimo ClientRouter; część pozostałych skryptów używa astro:page-load. To ryzyko z analizy kodu, nie potwierdzona usterka w interakcji.
- Polityka prywatności opisuje cookie `cookies_accepted` i 365 dni, podczas gdy kod używa localStorage `cookieAccepted` bez terminu. Dostosować opis do faktycznego mechanizmu i umożliwić ponowną zmianę wyboru.
- Zmierzyć wydajność mobilną i Core Web Vitals przed zmianami oraz po nich; nie wykonano Lighthouse ani pomiarów użytkowników.
- Zweryfikować klawiaturę, kontrast, etykiety wyszukiwarki, aria-expanded menu i zarządzanie fokusem galerii. Brak pełnego audytu dostępności.

## Kolejność realizacji

1. Potwierdzenie faktów biznesowych: usługi priorytetowe, obszar, dyżur, terminy, dojazd, opinie.
2. Poprawki canonical i przekierowań, grafiki OG, danych strukturalnych i procesu publikacji szkiców.
3. Odświeżenie strony głównej, nawigacji, kontaktu i prezentacji istniejących realizacji.
4. Rozwinięcie stron usług i linkowania wewnętrznego; aktualizacja profilu Google; weryfikacja pomiaru.
5. Kontrola mobilna, dostępności, formularza, przekierowań i wydajności na podglądzie przed publikacją.
6. Na samym końcu nowe materiały blogowe, powiązane z gotowymi stronami usług.

## Ograniczenia

Nie uzyskano dostępu do interaktywnej przeglądarki: host przeglądarki i natywny kanał UI są niedostępne. Nie zweryfikowano wyglądu na ekranie, nawigacji mobilnej, odbioru formularzy ani aktualnych opinii Google. Brak dostępu do Search Console, GA4 i panelu profilu firmy uniemożliwia ocenę ruchu, zapytań, konwersji i pełnego stanu indeksowania. Wyszukiwanie publiczne nie zastępuje tych danych. Nie zmieniano kodu aplikacji ani niczego nie publikowano.
