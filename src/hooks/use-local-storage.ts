"use client";

import { useState, useEffect, useCallback } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    setValue(getStorageValue(key, defaultValue));
  }, [key, defaultValue]);

  useEffect(() => {
    // This effect will only run on the client, after the initial render,
    // so window.localStorage will be available.
    try {
      // Don't save the default value to localStorage until it's been changed.
      // This helps avoid writing to localStorage on the initial render.
      const storedValue = localStorage.getItem(key);
      if (storedValue !== JSON.stringify(value)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
