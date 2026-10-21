# Kumba Gounder Matrimony — product and launch plan

## What this prototype is

This React/Vite prototype presents a premium, mobile-ready first impression for a Kumba Gounder matrimonial service in Tamil Nadu. It uses invented sample profiles and abstract cultural artwork; it does **not** contain real member data, live matching, payment collection, or a directory of people.

The visual direction is intentionally calm rather than generic: warm paper tones, temple-green, restrained gold and coral accents, editorial type, and a simple mandapam-inspired hero. The supplied devotional image should be treated as cultural mood reference only, not as a member photo, endorsement, or a replacement for licensed imagery.

## What a real matrimonial product needs

### Member roles

- **Candidate** — creates and controls their own profile.
- **Family representative** — helps a candidate, but the candidate remains the account owner and gives consent.
- **Verified member** — completed phone verification and any chosen document review.
- **Relationship manager** — handles support and assisted introductions; never gets unrestricted export access.
- **Administrator/moderator** — reviews reports, verification status, photos, and suspicious activity with an audit trail.

### Profile fields

Collect only information that is relevant to matchmaking. Start with: first name or display name, age/date of birth, city, education, occupation, family overview, interests, marital status, preferences, profile visibility, and contact preferences. Make sensitive fields optional and explain why each is requested.

Do not make caste-subgroup, horoscope, income, disability, or photographs mandatory. If horoscopes are offered, store them privately and let a member choose whether to share them. Do not collect government ID copies unless there is a documented, privacy-reviewed verification process and retention period.

### Discovery and matching

1. A person registers with a mobile OTP and confirms they are an adult.
2. They complete a profile, select visibility settings, and optionally invite a family representative.
3. A moderator verifies the profile according to the published rules.
4. Matching ranks people by opt-in preferences such as age range, city, education, occupation and family preferences. It must never silently exclude protected groups.
5. A member sends an **interest request**, not their phone number.
6. The recipient can accept, decline, ignore, block, or report. No explanation should be required to decline.
7. Only after **mutual acceptance** should the product reveal the selected contact route or open a secure in-app conversation.

This is how bride/groom details should be received: a safe preview first, then mutual consent, then a controlled contact hand-off. Do not send raw lists of profiles, phone numbers, or WhatsApp contacts to families. WhatsApp can be an optional notification channel after consent; it should not become the database.

## Payment model

Offer a free browsing tier, then simple time-bound memberships:

| Plan | Example inclusion | Example price |
| --- | --- | --- |
| Free | Create profile, browse selected preview cards, receive requests | ₹0 |
| Classic | 3-month profile visibility, send/receive introductions | ₹1,999 |
| Assisted | 6-month membership plus relationship-manager support | ₹3,499 |

For production payments in India, use a provider such as Razorpay or Cashfree. The sequence must be:

1. The backend creates an order with the exact plan, price, GST handling and member ID.
2. The browser opens the provider checkout. Card/UPI details must never pass through this website's server.
3. The backend verifies the provider's **signed webhook** and payment signature.
4. Only then does it activate membership, save an immutable payment record, and send a receipt/invoice.
5. Refunds, expiry, renewal reminders and failed payments must be handled by server-side status rules.

Never activate a membership only because a browser says “payment successful.” Never trust a payment amount received from the front end.

## Trust, safety and legal baseline

- Use clear Terms, Privacy Policy, Community Guidelines, Refund Policy, and a grievance/contact route before launch.
- Obtain explicit consent for profile creation, optional photo visibility, matching preferences, marketing messages and contact sharing.
- Use mobile OTP; consider selfie/video checks only if the legal/privacy case is strong and documented.
- Add report, block and unmatch controls to every introduction and conversation.
- Moderate uploaded photos and biographies; prohibit impersonation, harassment, financial scams, and sharing another person's contact information.
- Encrypt data in transit and at rest; use role-based access, audit logs, backups and access reviews.
- Show a delete-account option and publish a retention/deletion timeline. Store the minimum possible data.
- Restrict staff exports and require a documented operational reason for any data download.
- Obtain legal review for Indian privacy, consumer, tax and platform obligations before accepting money or processing sensitive personal information.

## Recommended technical architecture

| Layer | Recommended starting point |
| --- | --- |
| Public website | React + Vite (this prototype), deployed on Vercel/Netlify |
| Member application | React/Next.js with authenticated routes |
| API | Node.js/TypeScript or Next.js API routes with schema validation |
| Database | PostgreSQL with encrypted sensitive fields and row-level access controls |
| Authentication | Phone OTP provider plus session management; add email only as a recovery channel |
| Media | Private object storage with signed URLs and image moderation |
| Payments | Razorpay or Cashfree server-side order and webhook integration |
| Messaging | In-app messaging first; consented WhatsApp/SMS/email notifications second |
| Operations | Admin console, moderation queue, report queue, audit log, support CRM |

## Data model at a glance

- `users`: identity, phone verification, roles, account status.
- `profiles`: member-owned public/private profile fields and visibility controls.
- `family_representatives`: invitation and permissions scoped to a specific profile.
- `preferences`: opt-in matching preferences.
- `interests`: sender, recipient, state, timestamps and consent record.
- `conversations`: only created after the required acceptance state.
- `verifications`: type, reviewer, result, expiry; avoid storing raw documents where possible.
- `subscriptions`, `orders`, `payments`, `invoices`: immutable financial records.
- `reports`, `blocks`, `moderation_events`, `audit_logs`: safety and compliance activity.

## Delivery roadmap

### Phase 1 — brand and lead capture (1–2 weeks)

Launch this public website, a waitlist/profile-interest form, policies, support contact and analytics. Use only licensed or commissioned imagery. Do not claim member counts or successful matches until they can be proved.

### Phase 2 — private beta (4–6 weeks)

Build OTP login, profile creation, admin review, controlled discovery, interest requests, mutual-consent contact sharing, block/report tools and a small support workflow. Invite a limited number of real members and test every safety journey.

### Phase 3 — paid membership (2–3 weeks)

Add the payment provider, signed webhook verification, invoices, plan expiry rules, refunds and customer support scripts. Run test payments and refund scenarios before release.

### Phase 4 — assisted service and iteration

Add relationship-manager tools, consented reminders, verified badges, reporting dashboards, accessibility review and ongoing moderation. Measure response quality and safety reports rather than only registrations.

## Image direction

Use commissioned community/family photography or properly licensed stock with model releases: Tamil wedding textiles and details, tasteful home/celebration scenes, florals, kolam/architecture textures, and respectful portraits. Keep real member photos private and never scrape wedding photos from competitor sites or Google image results. The website can remain premium without public faces by using original patterns, editorial photography and abstract graphics.

## Before going live

1. Choose a real business name, owner, support phone/email and legal entity details.
2. Obtain legal and privacy review; publish policies and grievance contact.
3. Define verification rules, fraud escalation and staff permissions.
4. Confirm payment tax/GST, pricing, refunds and invoice format with an accountant.
5. Replace demo content with consented and moderated content only.
6. Complete mobile, accessibility, performance and security testing.

## Current implementation update

The prototype now includes a local Express API in `server/index.js`. It supports profile creation, safe public profile previews, consent-gated interest records, interest responses, and pending membership orders. It does not expose submitted mobile numbers through the profile list; the local implementation stores only a one-way mobile hash and the last four digits.

This is a development backend, not a launch backend. It has no real login/session authorization, OTP provider, database encryption, admin moderation portal, payment gateway, signed payment webhook, legal policy service or production hosting. Those controls are mandatory before accepting genuine member profiles, sensitive data, or payments.
