-- Enable RLS on backup table (it's just for safety, no access needed)
ALTER TABLE mosques_backup_20260207 ENABLE ROW LEVEL SECURITY;

-- No policies needed - backup should not be accessible via API