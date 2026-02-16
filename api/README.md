# News API Integration - Setup Anleitung

Diese Anleitung erklärt, wie du die automatische News-Integration für die Medical News Sektion einrichtest.

## Voraussetzungen

- PHP 7.4 oder höher
- cURL-Extension für PHP aktiviert
- Webserver mit PHP-Unterstützung (Apache, Nginx, etc.)

## Schritt 1: NewsAPI.org Account erstellen

1. Besuche [https://newsapi.org/register](https://newsapi.org/register)
2. Erstelle einen kostenlosen Account
3. Nach der Registrierung erhältst du deinen API-Key

**Kostenloser Plan:**
- 100 Anfragen pro Tag
- Zugriff auf deutschsprachige News
- Keine Kreditkarte erforderlich

## Schritt 2: API-Key konfigurieren

1. Öffne die Datei `api/config.php`
2. Ersetze `YOUR_API_KEY_HERE` mit deinem tatsächlichen API-Key:

```php
define('NEWSAPI_KEY', 'dein-echter-api-key-hier');
```

3. Speichere die Datei

## Schritt 3: Testen

1. Öffne deine Website im Browser
2. Scrolle zur "Medical Pulse" Sektion
3. Die News sollten automatisch geladen werden

## Funktionsweise

### Backend (PHP)
- `get-news.php` - Ruft News von NewsAPI.org ab
- `config.php` - Enthält deinen API-Key (nicht ins Git committen!)
- `cache/` - Verzeichnis für gecachte News (automatisch erstellt)

### Caching
- News werden für 1 Stunde gecacht
- Reduziert API-Aufrufe und verbessert Performance
- Cache-Zeit kann in `get-news.php` angepasst werden (Variable `$cacheTime`)

### Frontend (JavaScript)
- Lädt News beim Seitenaufruf automatisch
- Zeigt Loading-Animation während des Ladens
- Ermöglicht Filterung nach Kategorien

## Kategorien

Das System erkennt automatisch folgende Kategorien basierend auf Keywords:

- **Digital Health**: eRezept, Videosprechstunde, ePA, digitale Gesundheit
- **KI & Forschung**: Künstliche Intelligenz, Studien, Forschung
- **MedTech**: Wearables, Geräte, Technologie
- **Gesundheitssystem**: Krankenkassen, GKV, Reformen, Politik

## Sicherheit

**WICHTIG:** Die Datei `config.php` enthält deinen privaten API-Key!

Füge folgende Zeile zu deiner `.gitignore` hinzu:
```
api/config.php
api/cache/
```

Erstelle stattdessen eine `config.example.php` für Git:
```php
<?php
define('NEWSAPI_KEY', 'YOUR_API_KEY_HERE');
```

## Fehlerbehebung

### "NewsAPI key not configured"
- Überprüfe, ob du den API-Key in `config.php` eingetragen hast
- Stelle sicher, dass du `YOUR_API_KEY_HERE` ersetzt hast

### "Failed to fetch news from NewsAPI"
- Überprüfe deine Internetverbindung
- Prüfe, ob dein API-Key gültig ist
- Überprüfe, ob du dein Tageslimit erreicht hast (100 Anfragen/Tag)

### Keine News werden angezeigt
- Öffne die Browser-Konsole (F12) und suche nach Fehlermeldungen
- Teste direkt: `https://deine-domain.de/api/get-news.php`
- Überprüfe PHP-Fehlerlog

### cURL-Fehler
- Stelle sicher, dass cURL für PHP installiert ist
- Bei Shared Hosting: Kontaktiere deinen Hoster

## Anpassungen

### Cache-Zeit ändern
In `get-news.php`, Zeile 21:
```php
$cacheTime = 3600; // 1 Stunde in Sekunden
```

### Anzahl der News ändern
In `get-news.php`, Zeile 35:
```php
$pageSize = 6; // Anzahl der Artikel
```

### Suchbegriffe anpassen
In `get-news.php`, Zeile 38:
```php
$keywords = urlencode('medizin OR gesundheit OR ...');
```

## Support

Bei Fragen oder Problemen:
- NewsAPI.org Dokumentation: [https://newsapi.org/docs](https://newsapi.org/docs)
- PHP cURL Dokumentation: [https://www.php.net/manual/de/book.curl.php](https://www.php.net/manual/de/book.curl.php)

## Alternativen

Falls NewsAPI.org nicht passt, gibt es folgende Alternativen:
- RSS-Feeds von Ärzteblatt.de
- Google News RSS
- Custom RSS-Aggregator
