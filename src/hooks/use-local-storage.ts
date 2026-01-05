"use client";

import { useState, useEffect, useCallback } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore parsing errors
      }
    }
  }
  return defaultValue;
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    // This effect runs on the client after hydration,
    // so it's safe to read from localStorage here.
    setValue(getStorageValue(key, defaultValue));
  }, [key, defaultValue]);


  useEffect(() => {
    // This effect runs when the 'value' changes to update localStorage.
    // It's also client-side only.
    if (typeof window !== "undefined") {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }
  }, [key, value]);

  return [value, setValue];
}
