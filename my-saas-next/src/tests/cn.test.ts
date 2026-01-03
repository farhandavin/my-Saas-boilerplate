import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils'; // Assuming cn export exists in utils

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    expect(cn('bg-red-500', false && 'text-white', 'p-4')).toBe('bg-red-500 p-4');
  });

  it('should merge tailwind classes properly using tailwind-merge (if implemented)', () => {
    // If you use clsx + tailwind-merge, 'p-4 p-2' -> 'p-2'
    expect(cn('p-4', 'p-2')).toBe('p-2'); 
  });
});
