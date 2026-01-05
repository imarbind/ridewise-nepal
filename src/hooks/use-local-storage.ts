"use client";

import { useState, useEffect } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
  // This function is now only called on the client.
  if (typeof window === "undefined") {
    return defaultValue;
  }
  try {
    const saved = localStorage.getItem(key);
    // If the saved value is null, it means it's not in localStorage yet.
    if (saved === null) {
      return defaultValue;
    }
    return JSON.parse(saved);
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
    // We pass a function to useState to run the initialization logic only once on the client.
    // This avoids hydration issues and the infinite loop.
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // This effect now only runs when the 'value' changes, to update localStorage.
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
