'use server';
/**
 * @fileOverview An AI agent for generating chat responses.
 *
 * - completeMessage - A function that handles the chat response generation process.
 * - MessageCompletionInput - The input type for the completeMessage function.
 * - MessageCompletionOutput - The return type for the completeMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageCompletionInputSchema = z.object({
  userInputText: z
    .string()
    .describe("The user's message to which the AI should respond."),
});
export type MessageCompletionInput = z.infer<typeof MessageCompletionInputSchema>;

const MessageCompletionOutputSchema = z.object({
  completion: z.string().describe('The AI-generated response to the user.' ),
});
export type MessageCompletionOutput = z.infer<typeof MessageCompletionOutputSchema>;

export async function completeMessage(input: MessageCompletionInput): Promise<MessageCompletionOutput> {
  return completeMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'messageCompletionPrompt',
  input: {schema: MessageCompletionInputSchema},
  output: {schema: MessageCompletionOutputSchema},
  prompt: `You are AuraChat, a friendly and helpful AI assistant. Your goal is to provide useful, concise, and concrete responses to the user.

User: {{{userInputText}}}
AI:`,
});

const completeMessageFlow = ai.defineFlow(
  {
    name: 'completeMessageFlow',
    inputSchema: MessageCompletionInputSchema,
    outputSchema: MessageCompletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
