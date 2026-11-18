# Local PostgreSQL

pgAdmin contains the local database named `kurumba_gounder_matrimony`.

The tables cover members, matrimonial profiles, match preferences, private profile and jathagam uploads, match review/consent, contact reveals, notifications, WhatsApp configuration, audit history, and the ₹199 membership payment lifecycle.

To connect the local API later, copy `.env.example` to the project root as `.env`, replace only the password placeholder with the PostgreSQL password chosen on this PC, and keep that `.env` file out of Git. A hosted Vercel deployment needs a managed PostgreSQL URL; `127.0.0.1` works only on this computer.
