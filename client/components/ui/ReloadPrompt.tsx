
import React from 'react';
import { Button } from './button';
import { toast } from 'sonner';

interface ReloadPromptProps {
  onReload: () => void;
}

export const showReloadPrompt = (onReload: () => void) => {
  toast('A new version is available.', {
    action: {
      label: 'Refresh',
      onClick: () => onReload(),
    },
    duration: Infinity,
  });
};
