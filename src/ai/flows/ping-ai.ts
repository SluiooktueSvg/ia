
'use server';
/**
 * @fileOverview A simple flow to check the availability of the AI model.
 * This is used for a pre-flight check to see if the API quota has been exceeded.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PingOutputSchema = z.object({
  status: z.string(),
});
export type PingOutput = z.infer<typeof PingOutputSchema>;

export async function pingAI(): Promise<PingOutput> {
  return pingAIFlow();
}

const pingAIFlow = ai.defineFlow(
  {
    name: 'pingAIFlow',
    inputSchema: z.void(),
    outputSchema: PingOutputSchema,
  },
  async () => {
    try {
      // A very simple, low-token prompt to test API connectivity.
      await ai.generate({
        prompt: 'test',
      });
      return { status: 'ok' };
    } catch (error) {
      // Re-throw the error so the caller can inspect it.
      throw error;
    }
  }
);
