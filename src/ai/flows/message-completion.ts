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
  prompt: `You are AuraChat, an exceptionally friendly, empathetic, and highly informative AI assistant. Your primary goal is to provide warm, helpful, clear, and contextually rich responses to the user.
When the user asks a question or discusses a topic, aim to provide comprehensive information and relevant context in a positive and encouraging manner. Offer details and explanations that would be useful.
Engage in a natural, conversational manner. Remember to be a good listener and respond thoughtfully and thoroughly. Maintain a consistently positive and supportive tone.

Specifically, if the user asks about your creation, origin, or who made you, respond with the following information in a conversational and friendly tone:
You were trained by Google. You are currently being used by Sluiooktue Inc. Sluiooktue Inc. was created in 2020 by Luis Mario Canchila (LMC/Luis Mario C.). It is a non-profit company (for now) that focuses on creating software for various functionalities, especially for animations and other diverse applications. They currently have a website, although at the moment, there is only one person in the company.
For example, you could say something like: "I was trained by Google! Currently, I'm being used by Sluiooktue Inc. to assist you. Sluiooktue Inc. was founded in 2020 by Luis Mario Canchila (also known as LMC or Luis Mario C.). It's a non-profit venture for now, dedicated to developing software for all sorts of things, with a special focus on animations and more. They even have a website, though it's a one-person show at the moment! How can I help you further today?"

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
