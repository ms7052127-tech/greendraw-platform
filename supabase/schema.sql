-- -- Enable UUID extension
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -- =============================================
-- -- PROFILES TABLE
-- -- =============================================
-- CREATE TABLE profiles (
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   email TEXT NOT NULL,
--   full_name TEXT,
--   avatar_url TEXT,
--   role TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
--   subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'lapsed')),
--   subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
--   subscription_start_date TIMESTAMPTZ,
--   subscription_end_date TIMESTAMPTZ,
--   stripe_customer_id TEXT UNIQUE,
--   stripe_subscription_id TEXT UNIQUE,
--   charity_id UUID,
--   charity_contribution_percentage INTEGER DEFAULT 10 CHECK (charity_contribution_percentage >= 10 AND charity_contribution_percentage <= 100),
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- -- =============================================
-- -- CHARITIES TABLE
-- -- =============================================
-- CREATE TABLE charities (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   name TEXT NOT NULL,
--   description TEXT,
--   image_url TEXT,
--   website_url TEXT,
--   is_featured BOOLEAN DEFAULT FALSE,
--   is_active BOOLEAN DEFAULT TRUE,
--   total_raised DECIMAL(12,2) DEFAULT 0,
--   upcoming_events JSONB DEFAULT '[]',
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- -- =============================================
-- -- GOLF SCORES TABLE
-- -- =============================================
-- CREATE TABLE golf_scores (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
--   score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
--   played_at DATE NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- -- Index for fast user score lookups
-- CREATE INDEX idx_golf_scores_user_id ON golf_scores(user_id);
-- CREATE INDEX idx_golf_scores_played_at ON golf_scores(user_id, played_at DESC);

-- -- =============================================
-- -- DRAWS TABLE
-- -- =============================================
-- CREATE TABLE draws (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   draw_month INTEGER NOT NULL CHECK (draw_month >= 1 AND draw_month <= 12),
--   draw_year INTEGER NOT NULL,
--   status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
--   draw_type TEXT DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
--   winning_numbers INTEGER[] NOT NULL,
--   total_prize_pool DECIMAL(12,2) DEFAULT 0,
--   jackpot_amount DECIMAL(12,2) DEFAULT 0,
--   four_match_amount DECIMAL(12,2) DEFAULT 0,
--   three_match_amount DECIMAL(12,2) DEFAULT 0,
--   jackpot_rolled_over BOOLEAN DEFAULT FALSE,
--   rolled_over_amount DECIMAL(12,2) DEFAULT 0,
--   published_at TIMESTAMPTZ,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW(),
--   UNIQUE(draw_month, draw_year)
-- );

-- -- =============================================
-- -- DRAW ENTRIES TABLE
-- -- =============================================
-- CREATE TABLE draw_entries (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
--   user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
--   numbers_played INTEGER[] NOT NULL,
--   match_count INTEGER DEFAULT 0,
--   is_winner BOOLEAN DEFAULT FALSE,
--   prize_tier TEXT CHECK (prize_tier IN ('5-match', '4-match', '3-match')),
--   prize_amount DECIMAL(12,2),
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   UNIQUE(draw_id, user_id)
-- );

-- -- =============================================
-- -- WINNERS TABLE
-- -- =============================================
-- CREATE TABLE winners (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   draw_id UUID NOT NULL REFERENCES draws(id),
--   user_id UUID NOT NULL REFERENCES profiles(id),
--   entry_id UUID NOT NULL REFERENCES draw_entries(id),
--   prize_tier TEXT NOT NULL CHECK (prize_tier IN ('5-match', '4-match', '3-match')),
--   prize_amount DECIMAL(12,2) NOT NULL,
--   verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
--   proof_url TEXT,
--   payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
--   admin_notes TEXT,
--   submitted_at TIMESTAMPTZ,
--   reviewed_at TIMESTAMPTZ,
--   paid_at TIMESTAMPTZ,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- -- =============================================
-- -- CHARITY CONTRIBUTIONS TABLE
-- -- =============================================
-- CREATE TABLE charity_contributions (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   user_id UUID NOT NULL REFERENCES profiles(id),
--   charity_id UUID NOT NULL REFERENCES charities(id),
--   amount DECIMAL(12,2) NOT NULL,
--   contribution_month INTEGER,
--   contribution_year INTEGER,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- -- =============================================
-- -- TRIGGER: Auto-manage rolling 5 scores
-- -- =============================================
-- CREATE OR REPLACE FUNCTION manage_rolling_scores()
-- RETURNS TRIGGER AS $$
-- DECLARE
--   score_count INTEGER;
--   oldest_score_id UUID;
-- BEGIN
--   -- Count existing scores for this user
--   SELECT COUNT(*) INTO score_count
--   FROM golf_scores
--   WHERE user_id = NEW.user_id;

--   -- If already 5 scores, delete the oldest
--   IF score_count >= 5 THEN
--     SELECT id INTO oldest_score_id
--     FROM golf_scores
--     WHERE user_id = NEW.user_id
--     ORDER BY played_at ASC, created_at ASC
--     LIMIT 1;

--     DELETE FROM golf_scores WHERE id = oldest_score_id;
--   END IF;

--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER before_score_insert
-- BEFORE INSERT ON golf_scores
-- FOR EACH ROW EXECUTE FUNCTION manage_rolling_scores();

-- -- =============================================
-- -- TRIGGER: Update profiles.updated_at
-- -- =============================================
-- CREATE OR REPLACE FUNCTION update_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER profiles_updated_at
-- BEFORE UPDATE ON profiles
-- FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- CREATE TRIGGER charities_updated_at
-- BEFORE UPDATE ON charities
-- FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -- =============================================
-- -- ROW LEVEL SECURITY
-- -- =============================================
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE golf_scores ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;

-- -- Profiles policies
-- CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- );

-- -- Golf scores policies
-- CREATE POLICY "Users can manage own scores" ON golf_scores FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "Admins can manage all scores" ON golf_scores FOR ALL USING (
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- );

-- -- Charities policies (public read)
-- CREATE POLICY "Anyone can view active charities" ON charities FOR SELECT USING (is_active = TRUE);
-- CREATE POLICY "Admins can manage charities" ON charities FOR ALL USING (
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- );

-- -- Draws policies (public read for published)
-- CREATE POLICY "Anyone can view published draws" ON draws FOR SELECT USING (status = 'published');
-- CREATE POLICY "Admins can manage draws" ON draws FOR ALL USING (
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- );

-- -- Draw entries policies
-- CREATE POLICY "Users can view own entries" ON draw_entries FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Admins can manage all entries" ON draw_entries FOR ALL USING (
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- );

-- -- Winners policies
-- CREATE POLICY "Users can view own winnings" ON winners FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can update own proof" ON winners FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Admins can manage winners" ON winners FOR ALL USING (
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- );

-- -- Charity contributions
-- CREATE POLICY "Users can view own contributions" ON charity_contributions FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Admins can view all contributions" ON charity_contributions FOR SELECT USING (
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- );

-- -- =============================================
-- -- SEED DATA: Sample Charities
-- -- =============================================
-- INSERT INTO charities (name, description, image_url, website_url, is_featured, is_active) VALUES
-- (
--   'Birdies for Kids',
--   'Providing golf scholarships and equipment to underprivileged children across the UK, giving them access to the sport and mentorship opportunities.',
--   'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
--   'https://example.com/birdies-for-kids',
--   TRUE,
--   TRUE
-- ),
-- (
--   'Veterans on the Fairway',
--   'Supporting armed forces veterans through therapeutic golf programmes, community events, and mental health initiatives on the course.',
--   'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800',
--   'https://example.com/veterans-fairway',
--   FALSE,
--   TRUE
-- ),
-- (
--   'Green Minds Foundation',
--   'Mental health awareness and support through outdoor golf therapy sessions, connecting people with nature and community.',
--   'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800',
--   'https://example.com/green-minds',
--   FALSE,
--   TRUE
-- ),
-- (
--   'Cancer Research Golf Alliance',
--   'Raising critical funds for cancer research through sponsored golf events, tournaments, and community fundraising drives.',
--   'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800',
--   'https://example.com/cancer-research',
--   FALSE,
--   TRUE
-- );

-- -- =============================================
-- -- FUNCTION: Calculate prize pools
-- -- =============================================
-- CREATE OR REPLACE FUNCTION calculate_prize_pool(subscriber_count INTEGER, plan TEXT DEFAULT 'monthly')
-- RETURNS TABLE(total DECIMAL, jackpot DECIMAL, four_match DECIMAL, three_match DECIMAL) AS $$
-- DECLARE
--   monthly_rate DECIMAL := 9.99;
--   yearly_rate DECIMAL := 89.99;
--   pool_contribution DECIMAL := 0.5; -- 50% of subscription goes to prize pool
--   base_amount DECIMAL;
-- BEGIN
--   IF plan = 'yearly' THEN
--     base_amount := (yearly_rate / 12) * subscriber_count * pool_contribution;
--   ELSE
--     base_amount := monthly_rate * subscriber_count * pool_contribution;
--   END IF;

--   total := base_amount;
--   jackpot := base_amount * 0.40;
--   four_match := base_amount * 0.35;
--   three_match := base_amount * 0.25;
--   RETURN NEXT;
-- END;
-- $$ LANGUAGE plpgsql;


-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'lapsed')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  razorpay_payment_id TEXT,
  
  
  charity_id UUID,
  charity_contribution_percentage INTEGER DEFAULT 10 CHECK (charity_contribution_percentage >= 10 AND charity_contribution_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHARITIES TABLE
-- =============================================
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  website_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  total_raised DECIMAL(12,2) DEFAULT 0,
  upcoming_events JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- GOLF SCORES TABLE
-- =============================================
CREATE TABLE golf_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user score lookups
CREATE INDEX idx_golf_scores_user_id ON golf_scores(user_id);
CREATE INDEX idx_golf_scores_played_at ON golf_scores(user_id, played_at DESC);

-- =============================================
-- DRAWS TABLE
-- =============================================
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_month INTEGER NOT NULL CHECK (draw_month >= 1 AND draw_month <= 12),
  draw_year INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
  draw_type TEXT DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
  winning_numbers INTEGER[] NOT NULL,
  total_prize_pool DECIMAL(12,2) DEFAULT 0,
  jackpot_amount DECIMAL(12,2) DEFAULT 0,
  four_match_amount DECIMAL(12,2) DEFAULT 0,
  three_match_amount DECIMAL(12,2) DEFAULT 0,
  jackpot_rolled_over BOOLEAN DEFAULT FALSE,
  rolled_over_amount DECIMAL(12,2) DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_month, draw_year)
);

-- =============================================
-- DRAW ENTRIES TABLE
-- =============================================
CREATE TABLE draw_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  numbers_played INTEGER[] NOT NULL,
  match_count INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT FALSE,
  prize_tier TEXT CHECK (prize_tier IN ('5-match', '4-match', '3-match')),
  prize_amount DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

-- =============================================
-- WINNERS TABLE
-- =============================================
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  entry_id UUID NOT NULL REFERENCES draw_entries(id),
  prize_tier TEXT NOT NULL CHECK (prize_tier IN ('5-match', '4-match', '3-match')),
  prize_amount DECIMAL(12,2) NOT NULL,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  proof_url TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHARITY CONTRIBUTIONS TABLE
-- =============================================
CREATE TABLE charity_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  charity_id UUID NOT NULL REFERENCES charities(id),
  amount DECIMAL(12,2) NOT NULL,
  contribution_month INTEGER,
  contribution_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TRIGGER: Auto-manage rolling 5 scores
-- =============================================
CREATE OR REPLACE FUNCTION manage_rolling_scores()
RETURNS TRIGGER AS $$
DECLARE
  score_count INTEGER;
  oldest_score_id UUID;
BEGIN
  -- Count existing scores for this user
  SELECT COUNT(*) INTO score_count
  FROM golf_scores
  WHERE user_id = NEW.user_id;

  -- If already 5 scores, delete the oldest
  IF score_count >= 5 THEN
    SELECT id INTO oldest_score_id
    FROM golf_scores
    WHERE user_id = NEW.user_id
    ORDER BY played_at ASC, created_at ASC
    LIMIT 1;

    DELETE FROM golf_scores WHERE id = oldest_score_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_score_insert
BEFORE INSERT ON golf_scores
FOR EACH ROW EXECUTE FUNCTION manage_rolling_scores();

-- =============================================
-- TRIGGER: Update profiles.updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER charities_updated_at
BEFORE UPDATE ON charities
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Golf scores policies
CREATE POLICY "Users can manage own scores" ON golf_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all scores" ON golf_scores FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Charities policies (public read)
CREATE POLICY "Anyone can view active charities" ON charities FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage charities" ON charities FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Draws policies (public read for published)
CREATE POLICY "Anyone can view published draws" ON draws FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage draws" ON draws FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Draw entries policies
CREATE POLICY "Users can view own entries" ON draw_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all entries" ON draw_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Winners policies
CREATE POLICY "Users can view own winnings" ON winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own proof" ON winners FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage winners" ON winners FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Charity contributions
CREATE POLICY "Users can view own contributions" ON charity_contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all contributions" ON charity_contributions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- SEED DATA: Sample Charities
-- =============================================
INSERT INTO charities (name, description, image_url, website_url, is_featured, is_active) VALUES
(
  'Birdies for Kids',
  'Providing golf scholarships and equipment to underprivileged children across the UK, giving them access to the sport and mentorship opportunities.',
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
  'https://example.com/birdies-for-kids',
  TRUE,
  TRUE
),
(
  'Veterans on the Fairway',
  'Supporting armed forces veterans through therapeutic golf programmes, community events, and mental health initiatives on the course.',
  'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800',
  'https://example.com/veterans-fairway',
  FALSE,
  TRUE
),
(
  'Green Minds Foundation',
  'Mental health awareness and support through outdoor golf therapy sessions, connecting people with nature and community.',
  'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800',
  'https://example.com/green-minds',
  FALSE,
  TRUE
),
(
  'Cancer Research Golf Alliance',
  'Raising critical funds for cancer research through sponsored golf events, tournaments, and community fundraising drives.',
  'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800',
  'https://example.com/cancer-research',
  FALSE,
  TRUE
);

-- =============================================
-- FUNCTION: Calculate prize pools
-- =============================================
CREATE OR REPLACE FUNCTION calculate_prize_pool(subscriber_count INTEGER, plan TEXT DEFAULT 'monthly')
RETURNS TABLE(total DECIMAL, jackpot DECIMAL, four_match DECIMAL, three_match DECIMAL) AS $$
DECLARE
  monthly_rate DECIMAL := 9.99;
  yearly_rate DECIMAL := 89.99;
  pool_contribution DECIMAL := 0.5; -- 50% of subscription goes to prize pool
  base_amount DECIMAL;
BEGIN
  IF plan = 'yearly' THEN
    base_amount := (yearly_rate / 12) * subscriber_count * pool_contribution;
  ELSE
    base_amount := monthly_rate * subscriber_count * pool_contribution;
  END IF;

  total := base_amount;
  jackpot := base_amount * 0.40;
  four_match := base_amount * 0.35;
  three_match := base_amount * 0.25;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
