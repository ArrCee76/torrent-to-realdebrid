# ⚡ Torrent to Real-Debrid

A browser extension that scrapes info hashes from torrent sites and sends them directly to your [Real-Debrid](https://real-debrid.com/) account. One click, no torrent client needed.

Works on **AudioBookBay**, **The Pirate Bay**, and any torrent site that displays an info hash on the page.

## How It Works

1. Browse a torrent site as normal
2. The extension detects the info hash on the page and shows a banner at the top
3. Click **"Send to Real-Debrid"** — the magnet is sent straight to your RD account
4. Real-Debrid downloads the torrent on their servers — fast, no seeding, no VPN needed
5. Grab your files from [real-debrid.com/torrents](https://real-debrid.com/torrents) or via any Real-Debrid compatible app

## Features

- **Auto-detects torrent pages** — if a page has an info hash, the extension activates
- **One-click download** — sends the magnet directly to Real-Debrid's API
- **Magnet link tools** — copy the magnet to clipboard or open it in a local torrent client
- **Works on any torrent site** — not limited to specific sites; if there's an info hash on the page, it works
- **Simple setup** — just paste your Real-Debrid API key and you're done
- **No data collection** — runs entirely locally, nothing sent to third parties

## Prerequisites

- A [Real-Debrid](https://real-debrid.com/) premium account
- Your API key from [real-debrid.com/apitoken](https://real-debrid.com/apitoken)

## Installation

### Chrome / Edge

1. Download or clone this repository
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge)
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `chrome/` folder

### Firefox

1. Download or clone this repository
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select any file inside the `firefox/` folder

> **Note:** Temporary Firefox add-ons are removed on restart. For permanent install, the extension needs to be signed via [addons.mozilla.org](https://addons.mozilla.org) or installed in Firefox Developer/Nightly with `xpinstall.signatures.required` set to `false`.

## Setup

1. Right-click the extension icon → **Options**
2. Paste your Real-Debrid API key (get it from [real-debrid.com/apitoken](https://real-debrid.com/apitoken))
3. Click **Save & Test** — you'll see your username and account status if the key is valid

That's it. Browse any torrent site and the banner will appear automatically.

## Screenshots

When the extension detects a torrent page, a banner appears at the top:

- **Get Magnet** — opens the magnet link in your default torrent client
- **Copy** — copies the magnet link to clipboard
- **Send to Real-Debrid** — sends it directly to your RD account

## Supported Sites

The extension works on any site that displays an info hash, including:

- AudioBookBay (all mirror domains)
- The Pirate Bay (and mirrors/proxies)
- 1337x
- RARBG mirrors
- Any site with a visible info hash and tracker information

## Project Structure

```
torrent-to-realdebrid/
├── chrome/             # Chrome/Edge (Manifest V3)
│   ├── manifest.json
│   ├── background.js   # Real-Debrid API integration
│   ├── content.js      # AudioBookBay detection
│   ├── content-tpb.js  # Generic torrent site detection
│   ├── content.css     # Banner styling
│   ├── options.html    # Settings page
│   ├── options.js
│   └── icons/
├── firefox/            # Firefox (Manifest V2)
│   └── (same files)
├── LICENSE
└── README.md
```

## Privacy

This extension runs entirely in your browser. Your API key is stored in your browser's sync storage and is only sent to `api.real-debrid.com`. No analytics, no tracking, no third-party services.

## License

MIT

## Author

[ArrCee76](https://github.com/ArrCee76)
