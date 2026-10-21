# OCTO Reseller Tester

A small, dependency-free tool for testing the [OCTO](https://docs.octo.travel) API (Open Connectivity for Tours and Activities) from a reseller's point of view. It works with Ventrata and any other OCTO-compliant supplier.

A tiny Node server proxies requests (avoiding browser CORS limits and keeping your API key off the page) and serves a single-page UI that walks through the reseller flow.

## Features

- Test connection (`GET /supplier`, falling back to `/suppliers`)
- Browse products, options, and units (with restrictions)
- Availability calendar and per-slot availability, with optional pricing
- Reserve, confirm, extend, cancel, and fetch bookings
- Request log showing every request and response, with status and timing
- Editable `Octo-Capabilities` header

## Quick start

Requires Node 18+. No `npm install` needed.

```bash
git clone https://github.com/<you>/octo-reseller-tester.git
cd octo-reseller-tester
cp .env.example .env      # then edit .env and add your API key
npm start
```

Open http://localhost:3000.

You can also skip `.env` and paste the key into the UI, or set it inline: `OCTO_API_KEY=... node server.js`.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `OCTO_API_KEY` | none | Bearer token for the supplier |
| `OCTO_ENDPOINT` | `https://api.ventrata.com/octo` | OCTO base URL |
| `PORT` | `3000` | Local server port |

## Security notes

- `.env` is git-ignored. Never commit API keys.
- The server is meant for local use only. Do not expose it publicly, since it forwards requests using your key.
- **Confirming a booking creates a real booking** on the supplier account. Use test or sandbox products and cancel afterwards.

## Limitations

Field names follow OCTO 1.x. Suppliers may implement different versions or capabilities, so adjust request bodies in `index.html` as needed.

## License

MIT
