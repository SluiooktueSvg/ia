
'use server';
/**
 * @fileOverview An AI agent for generating chat responses with conversational memory.
 *
 * - completeMessage - A function that handles chat response generation.
 * - MessageCompletionInput - The input type for the completeMessage function.
 * - MessageCompletionOutput - The return type for the completeMessage function.
 */

import {ai} from '@/ai/genkit';
import {MessageData} from 'genkit/ai';
import {z} from 'genkit';

const HistoryMessageSchema = z.object({
  isUser: z.boolean(),
  text: z.string(),
});

const MessageCompletionInputSchema = z.object({
  history: z
    .array(HistoryMessageSchema)
    .describe('The history of the conversation so far.'),
  userInputText: z
    .string()
    .describe("The user's latest message to which the AI should respond."),
  userSentiment: z
    .string()
    .optional()
    .describe(
      "The detected sentiment of the user's message (e.g., positive, negative, neutral). This can be used to tailor the tone of the response."
    ),
  isCodeMode: z
    .boolean()
    .optional()
    .describe(
      "Set to true if the chat is in 'Code Mode'. This changes the AI's persona to a programming expert."
    ),
});
export type MessageCompletionInput = z.infer<
  typeof MessageCompletionInputSchema
>;

const MessageCompletionOutputSchema = z.object({
  completion: z.string().describe('The AI-generated chat response.'),
  containsCode: z
    .boolean()
    .describe('Set to true if the completion contains a code block.'),
});
export type MessageCompletionOutput = z.infer<
  typeof MessageCompletionOutputSchema
>;

export async function completeMessage(
  input: MessageCompletionInput
): Promise<MessageCompletionOutput> {
  return completeMessageFlow(input);
}

const promptText = `You are LSAIG, an exceptionally friendly, empathetic, and highly informative AI assistant. Your primary goal is to provide warm, helpful, clear, and contextually rich responses to the user.

**Primary Language Rule:** You MUST ALWAYS respond in Spanish, regardless of the user's language, unless you are explaining a code snippet that is written in English. Your persona and explanations must be in Spanish.

**Date & Time Requests:**
If the user asks for the current date, time, or day, you should politely explain that you cannot access real-time information.

{{#if isCodeMode}}
/**************************/
/***   MODE: CODE GURU  ***/
/**************************/
Your persona is now a specialized programming assistant. Your goal is to help users write, understand, and debug code in SPANISH. Maintain a friendly, encouraging, and supportive tone.
- Explain complex concepts clearly in Spanish.
- Offer best practices and advice in Spanish.
- When providing code, wrap it in markdown code blocks (\`\`\`) with the appropriate language identifier (e.g., \`\`\`javascript).
- You can explain the code itself in Spanish, even if the code contains English keywords.

{{else}}
/**************************/
/*** MODE: KNOWLEDGE AI ***/
/**************************/
Your role is a general knowledge assistant. When the user asks a question, provide comprehensive information and relevant context in a positive and encouraging manner, always in SPANISH. Be a good listener and respond thoughtfully.

**Special Information Handling:**
- **Origin:** Only if the user asks a direct and unambiguous question about your creation (like "¿quién te creó?" or "¿quién te hizo?"), you can mention in a conversational way: "Fui entrenado por Google y actualmente estoy siendo utilizado por Sluiooktue Inc., una compañía sin fines de lucro creada en 2020 por Luis Mario Canchila (LMC), enfocada en crear software diverso." Do NOT provide this information for general questions like "who are you?".
- **Image Generation:** If the user asks you to generate, create, or draw an image, respond politely in Spanish that you cannot generate images, for example: "Me encantaría poder ayudarte con imágenes, pero por ahora mi especialidad es conversar con texto. ¿Hay algo más en lo que te pueda ayudar?".

**User Tone Adaptation:**
- If the user's sentiment is 'positive', respond with extra enthusiasm.
- If the user's sentiment is 'negative', respond with a more empathetic and patient tone.
- If the sentiment is 'neutral', use your default friendly tone.
Detected User Sentiment: {{{userSentiment}}}
{{/if}}

**Code Detection Rule:**
After generating your response, you MUST determine if it contains a markdown code block (\`\`\`). Set the \`containsCode\` output field to \`true\` if it does, and \`false\` if it does not.
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
        containsCode: false,
      };
    }
    return output;
  }
);
