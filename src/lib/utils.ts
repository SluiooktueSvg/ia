import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * A simple function to infer gender from a Spanish first name.
 * This is a basic implementation and may not be 100% accurate.
 * @param name The full name of the user.
 * @returns 'female' or 'male'.
 */
export function inferGenderFromName(name: string): 'female' | 'male' {
  if (!name) return 'male';

  const firstName = name.split(' ')[0].toLowerCase();

  // Common female name endings in Spanish
  const femaleEndings = ['a', 'd', 'z'];
  
  // List of common female names that don't follow the rule
  const femaleExceptions = [
    'isabel', 'dolores', 'pilar', 'carmen', 'rosario', 'beatriz', 'raquel',
    'soledad', 'lourdes', 'mercedes', 'maribel', 'araceli',
  ];

  // List of common male names that end in 'a'
  const maleExceptions = ['bautista', 'elias', 'jeremias', 'jonas', 'josue', 'luca', 'matias', 'nicolas'];
  
  if (maleExceptions.includes(firstName)) {
    return 'male';
  }

  if (femaleExceptions.includes(firstName)) {
    return 'female';
  }

  if (femaleEndings.some(ending => firstName.endsWith(ending))) {
    return 'female';
  }

  return 'male';
}
