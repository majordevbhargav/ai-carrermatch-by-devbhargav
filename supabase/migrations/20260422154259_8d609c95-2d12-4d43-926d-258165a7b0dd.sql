
-- Update timestamp helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  headline TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles selectable by owner"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Profiles insertable by owner"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Profiles updatable by owner"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CVs: one row per uploaded CV file, with extracted structured data
CREATE TABLE public.cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'My CV',
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','parsing','ready','failed')),
  error TEXT,
  raw_text TEXT,
  -- Structured extracted profile (skills, experience, education, projects, etc.)
  extracted JSONB,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX cvs_user_id_idx ON public.cvs(user_id);

ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CVs selectable by owner"
  ON public.cvs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "CVs insertable by owner"
  ON public.cvs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "CVs updatable by owner"
  ON public.cvs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "CVs deletable by owner"
  ON public.cvs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER cvs_updated_at BEFORE UPDATE ON public.cvs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for CVs (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false);

-- Storage RLS: users can only touch files inside their own user-id folder
CREATE POLICY "CV files selectable by owner"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "CV files insertable by owner"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "CV files updatable by owner"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "CV files deletable by owner"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);
