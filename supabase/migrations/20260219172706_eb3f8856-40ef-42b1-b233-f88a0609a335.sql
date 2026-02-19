-- Add UPDATE policy for organizer profiles (users can update their own)
CREATE POLICY "Users can update their own organizer profile"
ON public.event_organizer_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);