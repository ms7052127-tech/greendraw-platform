-- ============================================
-- Additional helper functions
-- ============================================

-- Function to increment charity total raised
CREATE OR REPLACE FUNCTION increment_charity_total(charity_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE charities
  SET total_raised = total_raised + amount
  WHERE id = charity_id;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'subscriber'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Allow service role to bypass RLS
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE golf_scores FORCE ROW LEVEL SECURITY;
ALTER TABLE draw_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE winners FORCE ROW LEVEL SECURITY;
ALTER TABLE charity_contributions FORCE ROW LEVEL SECURITY;

-- Service role policy (for admin operations)
CREATE POLICY "Service role bypass" ON profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass" ON golf_scores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass" ON draws FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass" ON draw_entries FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass" ON winners FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass" ON charities FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass" ON charity_contributions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Storage bucket for winner proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('proofs', 'proofs', true);

CREATE POLICY "Winners can upload proofs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'proofs' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view proofs" ON storage.objects
FOR SELECT USING (bucket_id = 'proofs');

CREATE POLICY "Service role can manage proofs" ON storage.objects
FOR ALL TO service_role USING (bucket_id = 'proofs');
