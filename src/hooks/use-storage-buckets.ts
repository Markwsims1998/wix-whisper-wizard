
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface BucketStatus {
  exists: boolean;
  isPublic: boolean;
  name: string;
}

export const useStorageBuckets = () => {
  const [buckets, setBuckets] = useState<BucketStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkBuckets = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error('Error checking storage buckets:', error);
          setError('Failed to load storage buckets');
          setBuckets([]);
          return;
        }
        
        // Check the status of each bucket
        const bucketStatuses = await Promise.all(data.map(async (bucket) => {
          const status: BucketStatus = {
            name: bucket.name,
            exists: true,
            isPublic: bucket.public || false
          };
          
          return status;
        }));
        
        setBuckets(bucketStatuses);
        
        // Check if photos and videos buckets exist
        const photoBucket = bucketStatuses.find(b => b.name === 'photos');
        const videoBucket = bucketStatuses.find(b => b.name === 'videos');
        
        if (!photoBucket) {
          console.warn('Photos bucket not found');
        }
        
        if (!videoBucket) {
          console.warn('Videos bucket not found');
        }
        
        // Log results for debugging
        console.log('Storage buckets status:', bucketStatuses);
        
      } catch (e: any) {
        setError(`Error checking storage: ${e.message}`);
        console.error('Error checking storage buckets:', e);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkBuckets();
  }, []);
  
  return {
    buckets,
    isLoading,
    error,
    hasBucket: (name: string) => buckets.some(b => b.name === name),
    isBucketPublic: (name: string) => buckets.find(b => b.name === name)?.isPublic || false
  };
};
