'use server';
/**
 * @fileOverview A Genkit tool for getting the current date and time.
 *
 * - getCurrentDate - A tool that provides the current date and time.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const getCurrentDate = ai.defineTool(
  {
    name: 'getCurrentDate',
    description: 'Get the current date and time. Use this when the user asks for the date, time, or day.',
    inputSchema: z.object({
      timezone: z.string().optional().describe('The IANA timezone name, e.g. "America/New_York"'),
    }),
    outputSchema: z.string(),
  },
  async ({ timezone }) => {
    // Return the date and time in a user-friendly Spanish format.
    return new Date().toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone, // Use the provided timezone
    });
  }
);
