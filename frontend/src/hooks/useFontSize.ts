import { useState, useEffect } from 'react';
import { FontSize } from '../types';

export function useFontSize(initialSize: FontSize = 'normal') {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('setu_font_size');
      if (saved === 'normal' || saved === 'large' || saved === 'xlarge') {
        return saved as FontSize;
      }
    }
    return initialSize;
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const rootSize =
        fontSize === 'xlarge' ? '21px' : fontSize === 'large' ? '18.5px' : '16px';
      document.documentElement.style.fontSize = rootSize;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('setu_font_size', fontSize);
    }
  }, [fontSize]);

  return { fontSize, setFontSize };
}
