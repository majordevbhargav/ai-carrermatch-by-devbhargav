-- Allow anonymous users to browse active job listings
CREATE POLICY "Anonymous users can view active jobs"
ON public.jobs
FOR SELECT
TO anon
USING (is_active = true);