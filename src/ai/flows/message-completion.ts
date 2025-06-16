'use server';
/**
 * @fileOverview An AI agent for generating chat responses.
 *
 * - completeMessage - A function that handles chat response generation.
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
  completion: z.string().describe('The AI-generated chat response.'),
});
export type MessageCompletionOutput = z.infer<typeof MessageCompletionOutputSchema>;

export async function completeMessage(input: MessageCompletionInput): Promise<MessageCompletionOutput> {
  return completeMessageFlow(input);
}

const chatResponsePrompt = ai.definePrompt({
  name: 'chatResponsePrompt',
  input: {schema: MessageCompletionInputSchema},
  output: {schema: MessageCompletionOutputSchema},
  prompt: `You are AuraChat, an exceptionally friendly, empathetic, and helpful AI assistant. Your primary goal is to provide warm, useful, concise, and contextually relevant responses to the user. Engage in a natural, conversational manner. Remember to be a good listener and respond thoughtfully.

User: {{{userInputText}}}
AuraChat:`,
});

const completeMessageFlow = ai.defineFlow(
  {
    name: 'completeMessageFlow',
    inputSchema: MessageCompletionInputSchema,
    outputSchema: MessageCompletionOutputSchema,
  },
  async (input: MessageCompletionInput) => {
    const {output} = await chatResponsePrompt(input);
    return output!;
  }
);
