-- JOBS TABLE -----------------------------------------------------------
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  employment_type TEXT,        -- Full-time, Internship, Contract...
  work_mode TEXT,              -- Remote, Hybrid, Onsite
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'USD',
  description TEXT NOT NULL,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  nice_to_have_skills TEXT[] NOT NULL DEFAULT '{}',
  url TEXT,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active jobs"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (is_active = true);

-- APPLICATIONS TABLE ---------------------------------------------------
CREATE TYPE public.application_status AS ENUM ('saved','applied','interview','offer','rejected');

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  cv_id UUID REFERENCES public.cvs(id) ON DELETE SET NULL,
  status public.application_status NOT NULL DEFAULT 'applied',
  match_score INTEGER,
  cover_letter TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their applications"
  ON public.applications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- updated_at trigger ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER jobs_touch BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER applications_touch BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_jobs_active ON public.jobs(is_active, posted_at DESC);
CREATE INDEX idx_applications_user ON public.applications(user_id);

-- SEED DEMO JOBS -------------------------------------------------------
INSERT INTO public.jobs (title, company, location, employment_type, work_mode, salary_min, salary_max, description, required_skills, nice_to_have_skills, url) VALUES
('Frontend Engineer Intern','Linear','Remote (EU)','Internship','Remote',2500,3500,'Build polished, fast UI for the next generation of issue tracking. Work closely with design on micro-interactions and animation.', ARRAY['React','TypeScript','CSS','Git'], ARRAY['Framer Motion','Figma','GraphQL'],'https://linear.app/careers'),
('Junior Full-Stack Developer','Vercel','New York, NY','Full-time','Hybrid',95000,125000,'Help ship Vercel''s dashboard and APIs. You''ll touch React, Node and our edge platform.', ARRAY['React','Node.js','TypeScript','PostgreSQL'], ARRAY['Next.js','tRPC','Redis'],'https://vercel.com/careers'),
('Data Analyst Intern','Spotify','Stockholm, Sweden','Internship','Hybrid',2200,2800,'Turn listener data into product insight. Build dashboards used by PMs across music & podcasts.', ARRAY['SQL','Python','Statistics','Excel'], ARRAY['dbt','Looker','Tableau'],'https://lifeatspotify.com'),
('Machine Learning Engineer','Hugging Face','Remote','Full-time','Remote',110000,160000,'Train, fine-tune and evaluate open-source LLMs. Contribute to widely-used libraries.', ARRAY['Python','PyTorch','Machine Learning','Transformers'], ARRAY['CUDA','Triton','MLOps'],'https://huggingface.co/jobs'),
('Product Designer','Figma','San Francisco, CA','Full-time','Hybrid',130000,170000,'Design tools designers love. Own end-to-end product flows for FigJam.', ARRAY['Figma','UI Design','Prototyping','User Research'], ARRAY['Motion','Design Systems','HTML/CSS'],'https://figma.com/careers'),
('Backend Engineer','Stripe','Dublin, Ireland','Full-time','Hybrid',85000,120000,'Build APIs that move trillions. Strong systems and reliability focus.', ARRAY['Ruby','PostgreSQL','API Design','Distributed Systems'], ARRAY['Go','Kafka','Terraform'],'https://stripe.com/jobs'),
('Growth Marketing Manager','Notion','Remote (Americas)','Full-time','Remote',105000,140000,'Own paid + lifecycle experiments that bring Notion to teams everywhere.', ARRAY['Marketing','Analytics','SEO','Copywriting'], ARRAY['HubSpot','SQL','Webflow'],'https://notion.so/careers'),
('iOS Engineer','Airbnb','Remote (US)','Full-time','Remote',140000,190000,'Craft the Airbnb iOS app used by millions of guests and hosts.', ARRAY['Swift','iOS','UIKit','SwiftUI'], ARRAY['Combine','RxSwift','GraphQL'],'https://careers.airbnb.com'),
('Junior Data Scientist','Duolingo','Pittsburgh, PA','Full-time','Hybrid',95000,125000,'A/B test learning features that shape how 500M people learn languages.', ARRAY['Python','SQL','Statistics','A/B Testing'], ARRAY['R','Spark','TensorFlow'],'https://duolingo.com/careers'),
('DevOps Engineer','GitLab','Remote','Full-time','Remote',115000,150000,'Scale GitLab.com''s infrastructure. Kubernetes, Terraform, observability.', ARRAY['Kubernetes','Terraform','AWS','Linux'], ARRAY['Prometheus','Go','Ruby'],'https://about.gitlab.com/jobs'),
('UX Researcher Intern','Discord','San Francisco, CA','Internship','Onsite',3000,4000,'Run studies on community features used by 200M+ people.', ARRAY['User Research','Interviewing','Qualitative Analysis'], ARRAY['Figma','Dovetail','Statistics'],'https://discord.com/jobs'),
('Cloud Solutions Engineer','Cloudflare','London, UK','Full-time','Hybrid',75000,105000,'Help customers deploy Workers, R2 and Zero Trust at scale.', ARRAY['JavaScript','Networking','Linux','Cloud'], ARRAY['Rust','Workers','BGP'],'https://cloudflare.com/careers');