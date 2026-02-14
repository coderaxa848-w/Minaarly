
-- RLS for issue_report_form
ALTER TABLE public.issue_report_form ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all bug reports"
ON public.issue_report_form FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update bug reports"
ON public.issue_report_form FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert bug reports"
ON public.issue_report_form FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bug reports"
ON public.issue_report_form FOR SELECT
USING (auth.uid() = user_id);

-- RLS for user_suggestions
ALTER TABLE public.user_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all suggestions"
ON public.user_suggestions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update suggestions"
ON public.user_suggestions FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert suggestions"
ON public.user_suggestions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own suggestions"
ON public.user_suggestions FOR SELECT
USING (auth.uid() = user_id);
