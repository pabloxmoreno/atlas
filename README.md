# ATLAS Gym Tracker // CORE.TRAIN 🏋️‍♂️⚡

**ATLAS Gym Tracker** (znany również jako **CORE.TRAIN**) to zaawansowana, zoptymalizowana pod kątem wydajności aplikacja webowa typu Single Page Application (SPA) służąca do rejestrowania treningów siłowych i monitorowania postępów. 

Zaprojektowana w minimalistycznym i ekstremalnie czytelnym stylu **High Density**, aplikacja oferuje bezkompromisowe wrażenia wizualne (ciemny motyw *Cosmic Slate*, wyraziste akcenty o kolorze `#F27D26`, ostre geometryczne linie bez zaokrągleń oraz czcionki *Space Grotesk* i *JetBrains Mono* dla technicznego, profesjonalnego sznytu).

---

## 🚀 Główne Funkcje Aplikacji

### ⚡ 1. Zaawansowane Śledzenie Treningów
*   **Aktywny Timer Sesji:** Precyzyjne odmierzanie czasu trwania treningu z sekundnikiem na żywo.
*   **Struktura Serii:** Możliwość elastycznego oznaczania serii rozgrzewkowych (`Warmup`), serii roboczych oraz precyzyjne punktowanie skali zmęczenia **RPE (Rate of Perceived Exertion)** w skali 1-10.
*   **Baza Ćwiczeń z Kategoriami:** Dostęp do wbudowanego katalogu ćwiczeń podzielonych na partie (Klatka piersiowa, Plecy, Nogi, Barki, Ramiona, Brzuch, Kardio, Inne) z możliwością dodawania własnych unikalnych ćwiczeń.
*   **Szablony Treningowe:** Szybki start dzięki zapisanym planom (np. *Hypertrophy B*, *Push/Pull/Legs*). Twórz, edytuj i uruchamiaj ulubione zestawy ćwiczeń jednym kliknięciem.

### 🧠 2. Integracja z AI (Sztuczną Inteligencją)
*   **Eksporter Raportów AI:** Narzędzie automatycznie generujące uporządkowaną strukturę w formacie **Markdown**, zoptymalizowaną pod kątem wklejenia do dużych modeli językowych (np. *Google Gemini*, *ChatGPT*, *Claude*).
*   **Analiza Danych:** Raport zbiera statystyki z ostatnich 14, 30 lub 90 dni (łączny tonaż, spalone kalorie, liczba treningów, parametry fizyczne, szczegółowa historia ćwiczeń wraz z seriami i notatkami).
*   **Gotowe Prompty Treningowe:** Na końcu wygenerowanego raportu użytkownik otrzymuje gotowe szablony pytań do skopiowania, ułatwiające otrzymanie precyzyjnych wskazówek dotyczących zbilansowania planu, doboru kalorii czy poprawy progresji siłowej.

### ⚖️ 3. Kalkulator Kalorii i Profil Fizyczny
*   **Profil Biologiczny:** Wprowadź swoją wagę (kg) oraz wzrost (cm) bezpośrednio w zakładce profilu.
*   **Dynamiczne Wskaźniki:** Natychmiastowe obliczanie wskaźnika masy ciała **BMI** wraz z opisem (np. waga prawidłowa) oraz dobowej podstawowej przemiany materii **BMR** na podstawie wzoru *Mifflina-St Jeora*.
*   **Kalkulacja Wydatku Energetycznego:** Automatyczne i spersonalizowane liczenie spalonych kalorii (kcal) dla każdego ukończonego treningu na podstawie:
    *   Wagi i wzrostu użytkownika (jego unikalnego BMR).
    *   Czasu trwania treningu z dokładnością co do sekundy.
    *   Średniego współczynnika **MET (Metabolic Equivalent of Task)** przypisanego do zaangażowanych w sesji grup mięśniowych (np. ciężkie sesje nóg lub kardio charakteryzują się odpowiednio wyższym wydatkiem).

### 📈 4. Wizualizacja Postępów i Statystyki
*   **Wizualny Pulpit (Dashboard):** Szybki wgląd w sumaryczną liczbę treningów, całkowity przerzucony ciężar (tonaż) w historii, średni czas treningu oraz łączne spalone kalorie.
*   **Interaktywne Wykresy:** Dynamicznie rysowane wykresy liniowe i obszarowe SVG prezentujące progres ciężaru w danym ćwiczeniu z automatycznym skalowaniem osi i interaktywnymi tooltipami.
*   **Historia Treningów:** Wygodna i szczegółowa lista ukończonych sesji z wyszukiwarką, możliwością rozwijania szczegółów i natychmiastowym podglądem spalonych kalorii oraz tonażu każdej z nich.

### 💾 5. Prywatność i Portatywność Danych
*   **Prywatność 100%:** Wszystkie dane są zapisywane wyłącznie lokalnie w pamięci Twojej przeglądarki (`localStorage`). Żadne informacje o Twojej wadze, sile czy planach nie są wysyłane na zewnętrzne serwery.
*   **Kopia Zapasowa (JSON):** Prosty eksport całego profilu, szablonów i historii treningów do jednego, lekkiego pliku tekstowego `.json`. Możliwość łatwego przywrócenia danych (importu) na dowolnym innym urządzeniu.
*   **Opcja Pełnego Resetu:** Możliwość natychmiastowego usunięcia wszystkich danych z pamięci podręcznej i przywrócenia aplikacji do stanu początkowego.

---

## 🛠️ Architektura Technologiczna

Aplikacja została zbudowana przy użyciu nowoczesnych narzędzi gwarantujących najwyższą szybkość działania:
*   **React 18** z językiem **TypeScript** – zapewniający doskonałą modułowość i pełne bezpieczeństwo typów.
*   **Vite** – ultraszybki bundler wspierający proces budowania produkcyjnego.
*   **Tailwind CSS** – do precyzyjnego pozycjonowania i nadawania stylów w oparciu o klasy narzędziowe.
*   **Lucide React** – spójna i elegancka paczka ikon wektorowych.

---

## ⚙️ Instalacja i Uruchomienie Lokalne

Aby uruchomić projekt na własnym komputerze, wykonaj poniższe kroki:

1.  **Sklonuj repozytorium:**
    ```bash
    git clone https://github.com/twoj-username/atlas-gym-tracker.git
    cd atlas-gym-tracker
    ```

2.  **Zainstaluj zależności:**
    ```bash
    npm install
    ```

3.  **Uruchom serwer deweloperski:**
    ```bash
    npm run dev
    ```
    Aplikacja będzie dostępna w przeglądarce pod adresem `http://localhost:3000` (lub innym wskazanym w konsoli).

4.  **Budowanie wersji produkcyjnej:**
    ```bash
    npm run build
    ```
    Skompilowane, zoptymalizowane pliki statyczne zostaną zapisane w katalogu `/dist`.

---

## 🎨 Wygląd i Doświadczenie Użytkownika (Theme Spec)

*   **Tło i panele:** Głęboka, czysta czerń `#0A0A0C` oraz stalowe szarości `#0F0F12` i `#1A1A1D`.
*   **Elementy aktywne:** Żywy, energetyczny pomarańcz `#F27D26` (kod koloru z motywu *High Density*).
*   **Geometria:** Brak zaokrągleń (`border-radius: 0px`) – nadający aplikacji surowy, nowoczesny, industrialny charakter pulpitu dowodzenia.
*   **Typografia:** Space Grotesk (nagłówki o charakterze technologicznym) i JetBrains Mono (wskaźniki numeryczne, czasy, wagi).

---

## 🤝 Autor i Licencja

*   Aplikacja została przygotowana jako w pełni funkcjonalne, offline'owe narzędzie treningowe.
*   Kod udostępniany na licencji **MIT**. Możesz go dowolnie modyfikować i dopasowywać do własnych potrzeb!

---
*„Hard work beats talent when talent doesn't work hard.”* ⚡💪
