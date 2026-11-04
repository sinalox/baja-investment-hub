import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const DEFAULT_MAX_VERIFICATION_DAYS = 15;
export const DEFAULT_MIN_PHOTOS = 12;

// Ajustes del candado guardados en app_settings (solo admin)
export const useFichaSettings = () => {
  const { data } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('key, value');
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
    },
    staleTime: 5 * 60 * 1000,
  });

  const minPhotos = (data?.publish_min_photos ?? {}) as Record<string, number>;
  return {
    maxVerificationDays: Number(data?.publish_max_verification_days ?? DEFAULT_MAX_VERIFICATION_DAYS),
    minPhotosFor: (type: string) => minPhotos[type] ?? DEFAULT_MIN_PHOTOS,
  };
};
