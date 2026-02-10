import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MosqueAdminCheckResult {
  isMosqueAdmin: boolean;
  mosqueId: string | null;
  mosqueName: string | null;
  loading: boolean;
}

export function useMosqueAdminCheck(): MosqueAdminCheckResult {
  const { user, loading: authLoading } = useAuth();
  const [isMosqueAdmin, setIsMosqueAdmin] = useState(false);
  const [mosqueId, setMosqueId] = useState<string | null>(null);
  const [mosqueName, setMosqueName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      if (authLoading) return;
      if (!user) {
        setIsMosqueAdmin(false);
        setMosqueId(null);
        setMosqueName(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('mosque_admins')
          .select('mosque_id, mosques(name)')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error checking mosque admin status:', error);
          setIsMosqueAdmin(false);
        } else if (data) {
          setIsMosqueAdmin(true);
          setMosqueId(data.mosque_id);
          const mosqueData = data.mosques as unknown as { name: string } | null;
          setMosqueName(mosqueData?.name ?? null);
        } else {
          setIsMosqueAdmin(false);
        }
      } catch (err) {
        console.error('Failed to check mosque admin status:', err);
        setIsMosqueAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    check();
  }, [user, authLoading]);

  return { isMosqueAdmin, mosqueId, mosqueName, loading: loading || authLoading };
}
