'use server';
/**
 * @fileOverview An AI agent for generating chat responses and text completions.
 *
 * - completeMessage - A function that handles chat response generation or text completion.
 * - MessageCompletionInput - The input type for the completeMessage function.
 * - MessageCompletionOutput - The return type for the completeMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageCompletionInputSchema = z.object({
  userInputText: z
    .string()
    .describe("The user's message to which the AI should respond, or the partial text to autocomplete."),
  isSuggestion: z.boolean().optional().describe("Set to true if this is a request for an autocomplete suggestion, false or undefined for a full chat response.")
});
export type MessageCompletionInput = z.infer<typeof MessageCompletionInputSchema>;

const MessageCompletionOutputSchema = z.object({
  completion: z.string().describe('The AI-generated response or text completion.'),
});
export type MessageCompletionOutput = z.infer<typeof MessageCompletionOutputSchema>;

export async function completeMessage(input: MessageCompletionInput): Promise<MessageCompletionOutput> {
  return completeMessageFlow(input);
}

const chatResponsePrompt = ai.definePrompt({
  name: 'chatResponsePrompt',
  input: {schema: MessageCompletionInputSchema},
  output: {schema: MessageCompletionOutputSchema},
  prompt: `You are AuraChat, a friendly and helpful AI assistant. Your goal is to provide useful, concise, and concrete responses to the user.

User: {{{userInputText}}}
AI:`,
});

const suggestionPrompt = ai.definePrompt({
  name: 'suggestionPrompt',
  input: { schema: MessageCompletionInputSchema },
  output: { schema: MessageCompletionOutputSchema },
  prompt: `You are an autocomplete assistant. Given the user's partially typed message, complete it helpfully and concisely, continuing their thought.
User is typing: {{{userInputText}}}
Completion:`,
});

const completeMessageFlow = ai.defineFlow(
  {
    name: 'completeMessageFlow',
    inputSchema: MessageCompletionInputSchema,
    outputSchema: MessageCompletionOutputSchema,
  },
  async (input: MessageCompletionInput) => {
    if (input.isSuggestion) {
      const {output} = await suggestionPrompt(input);
      return output!;
    } else {
      const {output} = await chatResponsePrompt(input);
      return output!;
    }
  }
);