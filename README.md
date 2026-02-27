# Media Server

A lightweight media server built with Electron and Express.js. It accepts HTTP requests with URLs and opens them in Electron windows, with special handling for YouTube videos (auto-embedded player with autoplay).

## Quick Start

```bash
cd electron_wp
npm install
npm start
```

The server listens on port **2266** by default (configurable via `PORT` env variable).

## Usage

Once running, send HTTP GET requests to control it:

| Action | Request |
|--------|---------|
| Check status | `GET http://localhost:2266/` |
| Open a URL | `GET http://localhost:2266/?url=https://example.com` |
| Open YouTube | `GET http://localhost:2266/?url=https://www.youtube.com/watch?v=VIDEO_ID` |
| Close window | `GET http://localhost:2266/?url=KILL_app` |

## Browser Mode (no Electron)

If you don't need Electron windows and just want to open URLs in your default browser:

```bash
cd electron_wp
npm run browser
```

This starts a server on port **3000** that opens URLs in your system's default browser.

## Packaging

To create a standalone executable:

```bash
cd electron_wp
npm run package
```
