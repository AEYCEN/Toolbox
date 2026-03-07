# <img src="assets/img/AEYCEN.png" width="26" style="margin-right: 8px"> &nbsp;AEYCEN Toolbox

A collection of small, self-contained web tools for everyday developer tasks — fully client-side, no backend required.

![License](https://img.shields.io/badge/License-GPL3.0-333?style=flat)
![HTML](https://img.shields.io/badge/HTML-JS-f59e0b?style=flat)
![i18n](https://img.shields.io/badge/Internationalization-DE%20%7C%20EN-00e5ff?style=flat)

---

## Overview

The AEYCEN Toolbox is a curated set of utilities that simplify recurring tasks in development and administration. Every tool runs entirely in the browser — no data is ever sent to a server. The interface supports German and English via a built-in language switcher.

### Tools

| Tool                                                                 | Version         | Category | Description                                                                                                              |
|----------------------------------------------------------------------|-----------------|----------|--------------------------------------------------------------------------------------------------------------------------|
| **[HeidiDecode](https://aeycen.github.io/Toolbox/heidiDecode.html)** | v1.3 *(7.3.26)* | Encoding | Decrypt exported HeidiSQL connections (direct input or file import)                                                      |
| **[HashForge](https://aeycen.github.io/Toolbox/hashForge.html)**     | v3.1 *(7.3.26)* | Encoding | Password hashing (bcrypt), SHA checksums, strength tester, generator and hash comparison                                 |
| **[LinkLoom](https://aeycen.github.io/Toolbox/linkLoom.html)**       | v2.1 *(7.3.26)* | Encoding | URL encoding/decoding, URL parser, Base64, UTM builder and bulk mode                                                     |
| **[WordWatch](https://aeycen.github.io/Toolbox/wordWatch.html)**     | v2.1 *(7.3.26)* | Text     | Text analysis with word/character count, Flesch readability index, keyword extraction, transformations and find & replace |
| **[Calcul8tr](https://aeycen.github.io/Toolbox/calcul8tr.html)**     | v2.1 *(7.3.26)* | Math     | Expression calculator, number base converter, unit converter, percentage calculator, statistics and date difference       |

---

## Internationalization (i18n)

The toolbox supports multiple languages via YAML translation files loaded at runtime.

- **Switcher** — Locale buttons in the top-right corner of every page
- **Persistence** — Selected language is stored in `localStorage` and restored on next visit

---

### External Dependencies

| Library                                                          | Usage                          | Loaded via     |
|------------------------------------------------------------------|--------------------------------|----------------|
| [bcrypt.js](https://github.com/nicolo-ribaudo/dcodeio-bcryptjs)  | Password hashing in HashForge  | CDN (`cdnjs`)  |
| [js-yaml](https://github.com/nodeca/js-yaml)                     | YAML translation file parsing  | CDN (`cdnjs`)  |
| [Google Fonts](https://fonts.google.com/)                        | JetBrains Mono + Outfit        | CDN            |

Everything else relies exclusively on native browser APIs (`Web Crypto API`, `URL API`, `FileReader`, `Clipboard API`, etc.).

---

## Tool Details

### HashForge

Comprehensive hashing toolkit with five modules:

- **password_hash()** — Bcrypt hashing directly in the browser (client-side via `bcrypt.js`)
- **SHA Hashing** — SHA-1, SHA-256, SHA-384, SHA-512 using the Web Crypto API
- **Strength Test** — Real-time analysis with 10 criteria, entropy calculation and estimated brute-force crack time
- **Generator** — Cryptographically secure password generator with configurable length and character sets
- **Comparison** — Character-by-character diff of two hashes

### LinkLoom

URL toolkit with five tabs:

- **Encode** — `encodeURIComponent` / `decodeURIComponent`
- **URL Parser** — Breaks URLs down into protocol, host, path, query parameters, etc.
- **Base64** — Base64 encoding and decoding
- **UTM Builder** — Interactive UTM parameter generator with live preview
- **Bulk Mode** — Encode/decode multiple URLs at once

### HeidiDecode

Decrypts passwords from exported HeidiSQL connection files.

- **Direct input** — paste an encrypted hex string, get the plaintext password
- **File extraction** — drag & drop an exported `.txt` file; all connections (host, user, password) are automatically extracted and decrypted


### WordWatch

Text analysis tool with four modules:

- **Analysis** — Words, characters, sentences, paragraphs, reading/speaking time, Flesch readability index (adapted for German)
- **Keywords** — Top-15 extraction with stop-word filter (DE + EN)
- **Transform** — Upper/lowercase, title/sentence case, reverse, trim, sort, remove duplicates and more
- **Find & Replace** — With optional regex support and case-sensitivity toggle

### Calcul8tr

Mathematical multi-tool:

- **Calculator** — Expressions with `sqrt`, `sin`, `log`, `fact()`, constants (π, e) and history
- **Number Bases** — Live conversion between decimal, binary, octal and hexadecimal
- **Units** — 7 categories with swap logic: length, weight, temperature, data, time, area, speed
- **Percentage** — Four calculation modes (portion, ratio, change, markup/markdown)
- **Statistics** — Mean, median, mode, variance, standard deviation, geometric mean
- **Date** — Difference in days, weeks, months, business days, calendar weeks and more

---

## Shared Features

- **Tab persistence** — Each tool remembers the last active tab via `localStorage`
- **Custom number spinners** — Styled ▲/▼ buttons with hold-to-repeat, replacing the native browser controls
- **Unit swap logic** — Selecting the same unit on both sides in Calcul8tr automatically swaps them
- **Consistent dark theme** — Shared via `toolbox-theme.css` with per-tool accent overrides
- **Toast notifications** — Non-intrusive feedback on copy, errors, and actions

---

## Privacy

All processing happens exclusively in the browser. **No data is transmitted to external servers** — with the exception of the embedded Google Fonts, bcrypt.js, and js-yaml libraries, which are loaded via CDN.

---

## License

© 2022–2026 by [AEYCEN](https://github.com/AEYCEN) | with [GPLv3](LICENSE)
