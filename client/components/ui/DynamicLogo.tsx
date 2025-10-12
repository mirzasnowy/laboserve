import React from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useFirebaseImage } from '@/hooks/useFirebaseImage';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

export const DynamicLogo = () => {
  const { settings, loading: settingsLoading } = useSettings();
  const { imageUrl, loading: imageLoading } = useFirebaseImage(settings?.logoUrl);

  if (settingsLoading) {
    return <Skeleton className="w-10 h-10 rounded-xl" />;
  }

  const hasImage = imageUrl && imageUrl !== '/placeholder.svg';

  if (imageLoading) {
    return <Skeleton className="w-10 h-10 rounded-xl" />;
  }

  if (hasImage) {
    return <img src={imageUrl} alt="App Logo" className="w-10 h-10 object-cover rounded-xl" />;
  }

  // Fallback to the original logo with gradient
  return (
    <div className="w-10 h-10 rounded-xl shadow-lg gradient-primary flex items-center justify-center">
      <span className="text-white font-bold text-sm">LU</span>
    </div>
  );
};
