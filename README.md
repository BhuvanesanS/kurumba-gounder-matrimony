# Kurumba Gounder Matrimony

A React/Vite public experience plus a small Express backend for local development. It is a consent-first prototype: the API stores submitted profile details locally, returns only safe public profile fields, and provides the start of interest and membership-order flows.

## Run locally

Open two PowerShell terminals in this folder.

```powershell
npm run server
```

```powershell
npm run dev
```

Open the URL printed by Vite. The Vite development proxy sends `/api` requests to `http://127.0.0.1:8787`.

## Available API routes

- `GET /api/health` — backend health check.
- `GET /api/profiles` — safe public profile previews; does not return phone numbers.
- `POST /api/profiles` — validates and stores a new profile as `pending` verification.
- `POST /api/interests` — creates a consent-gated interest record.
- `POST /api/interests/:interestId/respond` — accepts or declines an interest. Contact sharing remains a separate mutual-consent decision.
- `POST /api/orders` — creates a pending membership order record; it deliberately does not collect payment data.

Local development data is written to `server/data/matrimony.json`, which is ignored by Git. Delete that file only when no test records are needed.

## Production requirements

This is not production-ready authentication or payments. Before launch, add real phone OTP login, member sessions and authorization checks, encrypted contact storage, a database such as PostgreSQL, moderation/admin tools, a provider-hosted Razorpay or Cashfree checkout, signed webhook verification, legal policies and a privacy/security review.
