-- Kurumba Gounder Matrimony — PostgreSQL schema
-- Private media is stored as BYTEA so profile photos and horoscope documents
-- live inside PostgreSQL as requested. Do not expose profile_media publicly.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE profile_status AS ENUM ('draft', 'pending', 'verified', 'rejected', 'suspended');
CREATE TYPE match_status AS ENUM ('pending_super_admin_review', 'admin_approved_awaiting_family_consent', 'ready_for_contact_reveal', 'introduction_approved', 'rejected_by_super_admin');
CREATE TYPE interest_status AS ENUM ('pending', 'accepted', 'declined', 'withdrawn');
CREATE TYPE media_kind AS ENUM ('profile_photo', 'horoscope');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_hash TEXT UNIQUE NOT NULL,
  mobile_encrypted TEXT NOT NULL,
  mobile_last4 CHAR(4) NOT NULL,
  preferred_language VARCHAR(8) NOT NULL DEFAULT 'ta',
  whatsapp_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  whatsapp_opt_in_at TIMESTAMPTZ,
  role VARCHAR(24) NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  profile_for VARCHAR(24) NOT NULL DEFAULT 'self' CHECK (profile_for IN ('self', 'son', 'daughter', 'relative')),
  first_name VARCHAR(60) NOT NULL,
  age SMALLINT NOT NULL CHECK (age BETWEEN 18 AND 99),
  gender VARCHAR(12) NOT NULL CHECK (gender IN ('Bride', 'Groom')),
  looking_for VARCHAR(12) NOT NULL CHECK (looking_for IN ('Bride', 'Groom')),
  city VARCHAR(70) NOT NULL,
  kulam VARCHAR(60),
  rasi VARCHAR(60),
  nakshatram VARCHAR(60),
  education VARCHAR(120),
  occupation VARCHAR(140) NOT NULL,
  income_lpa NUMERIC(10,2),
  income_display VARCHAR(40),
  height_cm SMALLINT CHECK (height_cm BETWEEN 100 AND 250),
  family_type VARCHAR(60),
  about TEXT NOT NULL CHECK (char_length(about) <= 600),
  status profile_status NOT NULL DEFAULT 'pending',
  moderation_note TEXT,
  consent_at TIMESTAMPTZ NOT NULL,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE partner_preferences (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  minimum_age SMALLINT CHECK (minimum_age BETWEEN 18 AND 99),
  maximum_age SMALLINT CHECK (maximum_age BETWEEN 18 AND 99),
  expected_education VARCHAR(120),
  expected_occupation VARCHAR(140),
  minimum_income_lpa NUMERIC(10,2),
  maximum_income_lpa NUMERIC(10,2),
  expected_rasi VARCHAR(60),
  expected_nakshatram VARCHAR(60),
  expected_kulam VARCHAR(60),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (maximum_age IS NULL OR minimum_age IS NULL OR maximum_age >= minimum_age),
  CHECK (maximum_income_lpa IS NULL OR minimum_income_lpa IS NULL OR maximum_income_lpa >= minimum_income_lpa)
);

CREATE TABLE profile_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind media_kind NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
  content_bytes BYTEA NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size > 0 AND byte_size <= 2621440),
  sha256 CHAR(64) NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT TRUE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  UNIQUE (profile_id, kind)
);

CREATE TABLE match_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pair_key TEXT NOT NULL UNIQUE,
  criteria_score SMALLINT NOT NULL CHECK (criteria_score BETWEEN 0 AND 100),
  criteria_badge VARCHAR(80) NOT NULL,
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  horoscope_status VARCHAR(80) NOT NULL DEFAULT 'not_reviewed',
  status match_status NOT NULL DEFAULT 'pending_super_admin_review',
  family_a_consented BOOLEAN NOT NULL DEFAULT FALSE,
  family_b_consented BOOLEAN NOT NULL DEFAULT FALSE,
  contact_revealed_at TIMESTAMPTZ,
  super_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  super_admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (profile_a_id <> profile_b_id)
);

CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_review_id UUID REFERENCES match_reviews(id) ON DELETE SET NULL,
  status interest_status NOT NULL DEFAULT 'pending',
  message TEXT CHECK (char_length(message) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  CHECK (from_profile_id <> to_profile_id)
);

CREATE TABLE contact_reveals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_review_id UUID NOT NULL UNIQUE REFERENCES match_reviews(id) ON DELETE CASCADE,
  approved_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  contact_a_shared BOOLEAN NOT NULL DEFAULT FALSE,
  contact_b_shared BOOLEAN NOT NULL DEFAULT FALSE,
  whatsapp_chat_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment provider references only: never store card, UPI PIN, or bank details.
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_code VARCHAR(40) NOT NULL DEFAULT 'community_199',
  amount_paise INTEGER NOT NULL CHECK (amount_paise >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(32) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'active', 'failed', 'refunded', 'cancelled')),
  provider VARCHAR(40),
  provider_order_id VARCHAR(160) UNIQUE,
  provider_payment_id VARCHAR(160) UNIQUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  kind VARCHAR(80) NOT NULL,
  channel VARCHAR(24) NOT NULL CHECK (channel IN ('in_app', 'whatsapp')),
  status VARCHAR(32) NOT NULL DEFAULT 'queued',
  provider_message_id VARCHAR(160),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(60) NOT NULL,
  entity_id UUID,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE whatsapp_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
  business_chat_link TEXT,
  business_phone_number_id TEXT,
  template_language VARCHAR(12) NOT NULL DEFAULT 'ta',
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX profiles_discovery_idx ON profiles (status, gender, city, age);
CREATE INDEX profile_media_private_idx ON profile_media (profile_id, kind, is_private);
CREATE INDEX match_reviews_status_idx ON match_reviews (status, created_at DESC);
CREATE INDEX interests_recipient_idx ON interests (to_profile_id, status, created_at DESC);
CREATE INDEX notifications_queue_idx ON notifications (status, channel, created_at);
CREATE INDEX memberships_profile_idx ON memberships (profile_id, status, created_at DESC);

INSERT INTO whatsapp_settings (id, enabled) VALUES (TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
