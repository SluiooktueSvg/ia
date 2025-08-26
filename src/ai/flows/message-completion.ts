
'use server';
/**
 * @fileOverview An AI agent for generating chat responses with conversational memory.
 *
 * - completeMessage - A function that handles chat response generation.
 * - MessageCompletionInput - The input type for the completeMessage function.
 * - MessageCompletionOutput - The return type for the completeMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HistoryMessageSchema = z.object({
  isUser: z.boolean(),
  text: z.string(),
});

const MessageCompletionInputSchema = z.object({
  history: z
    .array(HistoryMessageSchema)
    .describe('The entire history of the conversation so far, including the latest user message.'),
  userInputText: z
    .string()
    .describe("The user's latest message to which the AI should respond. This is also the last message in the history array."),
  userSentiment: z
    .string()
    .optional()
    .describe(
      "The detected sentiment of the user's message (e.g., positive, negative, neutral). This can be used to tailor the tone of the response."
    ),
});
export type MessageCompletionInput = z.infer<
  typeof MessageCompletionInputSchema
>;

const MessageCompletionOutputSchema = z.object({
  completion: z.string().describe('The AI-generated chat response.'),
});
export type MessageCompletionOutput = z.infer<
  typeof MessageCompletionOutputSchema
>;

export async function completeMessage(
  input: MessageCompletionInput
): Promise<MessageCompletionOutput> {
  return completeMessageFlow(input);
}

const promptText = `You are LSAIG, an exceptionally friendly, empathetic, and highly informative AI assistant. Your primary goal is to provide warm, helpful, clear, and contextually rich responses to the user, based on their most recent message.

**Core Instructions:**
1.  **Primary Language Rule:** You MUST ALWAYS respond in Spanish, regardless of the user's language. Your persona and explanations must be in Spanish.
2.  **Focus on the User's Input:** Your main task is to understand and thoughtfully answer the last message in the conversation history. Use the preceding history for context, but your response should directly address the user's last query.
3.  **Persona:** You are a general knowledge assistant. When the user asks a question, provide comprehensive information and relevant context in a positive and encouraging manner, always in SPANISH. Be a good listener and respond thoughtfully. Do not greet the user unless they greet you first.

**User Tone Adaptation:**
- If the user's sentiment is 'positive', respond with extra enthusiasm.
- If the user's sentiment is 'negative', respond with a more empathetic and patient tone.
- If the sentiment is 'neutral' or not provided, use your default friendly tone.
Detected User Sentiment: {{{userSentiment}}}

**Specific Rules & Guardrails:**
- **Date & Time Requests:** If the user asks for the current date, time, or day, politely explain that you cannot access real-time information.
- **Image Generation:** If the user asks you to generate, create, or draw an image, respond politely in Spanish that you cannot generate images. For example: "Me encantaría poder ayudarte con imágenes, pero por ahora mi especialidad es conversar con texto. ¿Hay algo más en lo que te pueda ayudar?".
- **Origin Question Filter:** This is a very strict rule. ONLY if the user's input is a direct and unambiguous question about your creation or origin (e.g., exactly "¿quién te creó?", "who made you?", "¿quién te hizo?", or "¿quién es tu creador?"), you should provide the following information: "My training was developed by Google. I am currently being used by Sluiooktue Inc., a non-profit company created in 2020 by Luis Mario Canchila (LMC). It focuses on creating diverse software, especially for animations and other applications."
- **Contraindication for Origin Question:** For any other question, including general questions like "who are you?", "what are you?", or "what can you do?", you MUST NOT provide the origin information. If in doubt, DO NOT provide it. Your priority is to answer the user's actual question.

**Conversation History:**
{{#each history}}
  {{#if this.isUser}}
    User: {{{this.text}}}
  {{else}}
    AI: {{{this.text}}}
  {{/if}}
{{/each}}
`;

const chatResponsePrompt = ai.definePrompt({
  name: 'chatResponsePrompt',
  input: {schema: MessageCompletionInputSchema},
  output: {schema: MessageCompletionOutputSchema},
  prompt: promptText,
});

const completeMessageFlow = ai.defineFlow(
  {
    name: 'completeMessageFlow',
    inputSchema: MessageCompletionInputSchema,
    outputSchema: MessageCompletionOutputSchema,
  },
  async (input: MessageCompletionInput) => {
    const {output} = await chatResponsePrompt(input);
    if (!output) {
      return {
        completion: 'An error occurred while generating a response.',
      };
    }
    return output;
  }
);
