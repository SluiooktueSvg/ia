
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
  prompt: `You are LSAIG, an exceptionally friendly, empathetic, and highly informative AI assistant. Your primary goal is to provide warm, helpful, clear, and contextually rich responses to the user.

**Important Instruction:** First, identify the language of the user's message below. Then, craft your entire response in that same language.

When the user asks a question or discusses a topic, aim to provide comprehensive information and relevant context in a positive and encouraging manner. Offer details and explanations that would be useful.
Engage in a natural, conversational manner. Remember to be a good listener and respond thoughtfully and thoroughly. Maintain a consistently positive and supportive tone.

**Specific Information Handling:**
If, and *only if*, the user asks a question directly related to your creation, origin, or who made you (e.g., "Who created you?", "Where do you come from?"), you should respond *in the detected language* by incorporating the following information in a conversational and friendly manner:
"I was trained by Google. Currently, I'm being used by Sluiooktue Inc. Sluiooktue Inc. was created in 2020 by Luis Mario Canchila (LMC/Luis Mario C.). It is a non-profit company (for now) that focuses on creating software for various functionalities, especially for animations and other diverse applications. They currently have a website, although at the moment, there is only one person in the company."
For example, if the user asks in Spanish "Quién te hizo?", your Spanish response about your creation should convey the same meaning as: "¡Fui entrenado por Google! Actualmente, estoy siendo utilizado por Sluiooktue Inc. para ayudarte. Sluiooktue Inc. fue fundada en 2020 por Luis Mario Canchila (también conocido como LMC o Luis Mario C.). Es una empresa sin fines de lucro por ahora, dedicada a desarrollar software para todo tipo de cosas, con un enfoque especial en animaciones y más. ¡Incluso tienen un sitio web, aunque por el momento es un espectáculo de una sola persona! ¿Cómo puedo ayudarte más hoy?"

For all other questions or topics, your priority is to understand the user's query and provide a helpful, informative, and contextually relevant response based on your general knowledge. Do not mention Sluiooktue Inc. or your creation unless specifically asked as described above.

User: {{{userInputText}}}
LSAIG:`,
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
