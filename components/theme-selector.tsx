'use client';

import React from 'react';
import { useThemeConfig } from './active-theme';

export function ThemeSelector() {
  const { setActiveTheme } = useThemeConfig();

  // Set theme to amber and hide the selector
  React.useEffect(() => {
    setActiveTheme('amber');
  }, [setActiveTheme]);

  // Return null to hide the component completely
  return null;
}
