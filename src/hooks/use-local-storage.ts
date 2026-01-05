"use client";

import { useState, useEffect } from 'react';

// A utility to safely get a value from localStorage
function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  const saved = localStorage.getItem(key);
  // Using a try-catch block for safer JSON parsing
  try {
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // We initialize state with a function to ensure getStorageValue is only called once
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  // This effect runs whenever the `value` state changes, and updates localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);
  
  // This effect handles hydration by syncing state with localStorage on mount
  useEffect(() => {
    setValue(getStorageValue(key, defaultValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue];
}
