-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES 
  ('mosque-images', 'mosque-images', true, 2097152),  -- 2MB limit
  ('event-images', 'event-images', true, 2097152);    -- 2MB limit

-- Storage policies for mosque-images bucket
CREATE POLICY "Public can view mosque images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'mosque-images');

CREATE POLICY "Authenticated users can upload mosque images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'mosque-images');

CREATE POLICY "Mosque admins can update their images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'mosque-images');

CREATE POLICY "Mosque admins can delete their images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'mosque-images');

-- Storage policies for event-images bucket
CREATE POLICY "Public can view event images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Mosque admins can update event images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-images');

CREATE POLICY "Mosque admins can delete event images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-images');