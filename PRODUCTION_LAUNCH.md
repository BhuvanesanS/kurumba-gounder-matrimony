# Kurumba Gounder Matrimony — production launch plan

## Product journey

1. A bride, groom, or authorised family member creates an account with mobile OTP.
2. They complete a profile, choose what can be shown, upload photos, and provide consent.
3. A moderator checks the profile and changes it from `pending` to `verified`.
4. Verified members browse compatible introductions and send a private interest request.
5. The recipient accepts or declines in-app. Contact details remain hidden until a defined mutual-consent rule is fulfilled.
6. A ₹199 Community membership payment is created only after profile review and activated only after the payment provider webhook is verified.

## Compatibility assistant

The current engine gives reasons for its score and uses:

- bride/groom compatibility and age range
- Kulam rule flagging; it never treats a score as cultural or family approval
- district / Kongu region proximity
- rasi and nakshatram preferences entered by the family
- education, occupation, income range, and family preference

Do not describe this as horoscope certainty or a guaranteed match. A future LLM can summarise the existing score reasons, but it must never make eligibility, caste, religious, or sensitive-trait decisions.

## Data and image storage

Local development stores profiles in `server/data/matrimony.json` and photos in `server/uploads/`.

Before public launch, replace those local stores with:

- **Postgres**: profiles, consent records, interests, subscriptions, moderation audit trail, and notification delivery log.
- **Private object storage**: Vercel Blob, S3, or Cloudinary; store only signed/private image URLs until a profile is verified.
- **Role-based admin dashboard**: moderator, support, and super-admin roles.

## Payments — ₹199 Community membership

Use Razorpay or Cashfree. The browser must never decide whether membership is paid.

1. Server creates an order for `Community` at ₹199.
2. Client opens provider checkout with the returned order ID.
3. Provider sends a signed webhook to the server.
4. Server verifies the signature, stores payment event idempotently, and sets subscription status to `active`.
5. The user receives a receipt and membership confirmation.

Required secrets are stored only in deployment environment variables:

- `PAYMENT_KEY_ID`
- `PAYMENT_KEY_SECRET`
- `PAYMENT_WEBHOOK_SECRET`

## WhatsApp notification flow

Use the WhatsApp Business Cloud API or an approved BSP. Do not automate personal WhatsApp accounts.

1. Collect a separate WhatsApp opt-in with timestamp, phone hash, language, and consent text.
2. Submit approved utility templates, for example:
   - `profile_reviewed`: “Your profile is ready for discovery.”
   - `interest_received`: “A family has requested an introduction. Review privately in your account.”
   - `interest_accepted`: “Both sides have shown interest. Continue securely in the app.”
   - `payment_confirmed`: “Your ₹199 Community membership is active.”
3. Queue notification jobs after a server-side event; never send directly from the browser.
4. Record provider message ID, delivery state, retry count, and opt-out status.
5. Respect opt-out immediately and always leave contact details private until mutual consent.

Required environment variables:

- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_TEMPLATE_LANGUAGE` (for example `ta` or `en_US`)

## Required pre-launch controls

- Mobile OTP, account login, session handling, password reset or passwordless login
- explicit 18+ and data-sharing consent
- terms, privacy policy, refund/cancellation policy, and support contact
- rate limits, server-side validation, audit logs, encryption at rest, backups
- image review/moderation before public visibility
- signed payment webhooks and idempotency protection
- WhatsApp template approval and a tested opt-out flow
