
import { supabase } from '@/lib/supabaseClient';

export const fetchRecentReports = async (): Promise<{
  id: string;
  type: string | null;
  description: string | null;
  created_at: string;
  user_id: string | null;
  content_id: string | null;
}[] | null> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('id, type, description, created_at, user_id, content_id')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent reports:', error);
      return null;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching recent reports:', error);
    return null;
  }
};

export const fetchReportDetails = async (reportId: string): Promise<{
  id: string;
  type: string | null;
  description: string | null;
  created_at: string;
  user_id: string | null;
  content_id: string | null;
} | null> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('id, type, description, created_at, user_id, content_id')
      .eq('id', reportId)
      .single();

    if (error) {
      console.error('Error fetching report details:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching report details:', error);
    return null;
  }
};
