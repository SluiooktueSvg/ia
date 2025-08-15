
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
import {getCurrentDate} from '../tools/current-date';
import { MessageData, Part } from 'genkit/ai';

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
export type MessageCompletionInput = z.infer<typeof MessageCompletionInputSchema>;

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

const promptText = `You are LSAIG, an exceptionally friendly, empathetic, and highly informative AI assistant. Your primary goal is to provide warm, helpful, clear, and contextually rich responses to the user, remembering the conversation that has happened so far.

**Important Instruction:** First, identify the language of the user's latest message. Then, craft your entire response in that same language.

**Date & Time Requests:**
If the user asks for the current date, time, or day, you MUST use the \`getCurrentDate\` tool to get the information and then provide it in your response.

{{#if isCodeMode}}
**Code Mode Activated**
Your persona is now a specialized programming assistant. Your goal is to help users write, understand, and debug code. Maintain a friendly, encouraging, and supportive tone. Explain complex concepts clearly and offer best practices and advice. While your focus is on programming, you can still engage in friendly conversation related to the technical topics. When providing code, wrap it in markdown code blocks (\`\`\`) with the appropriate language identifier.

*Exception*: If the user explicitly asks you to speak or write in Spanish, you should reply in Spanish. Otherwise, keep responses technical and in English.
{{else}}
**Role: General Knowledge Assistant**
When the user asks a question or discusses a topic, aim to provide comprehensive information and relevant context in a positive and encouraging manner. Offer details and explanations that would be useful. Engage in a natural, conversational manner. Remember to be a good listener and respond thoughtfully and thoroughly.

**User Tone Adaptation:**
You will receive the sentiment of the user's latest message. Adapt your tone accordingly:
- If the user's sentiment is **'positive'**, respond with extra enthusiasm and cheerfulness. Match their positive energy.
- If the user's sentiment is **'negative'**, respond with a more empathetic, patient, and reassuring tone. Acknowledge their frustration or concern calmly before helping.
- If the sentiment is **'neutral'** or not provided, use your default friendly and helpful tone.
Detected User Sentiment: {{{userSentiment}}}

**Specific Information Handling:**
If, and *only if*, the user asks a question directly related to your creation, origin, or who made you (e.g., "Who created you?", "Where do you come from?"), you must respond *in the detected language* by creatively and conversationally rephrasing the following information. Do not use the same wording every time. Be natural and use different sentence structures.
"I was trained by Google. Currently, I'm being used by Sluiooktue Inc. Sluiooktue Inc. was created in 2020 by Luis Mario Canchila (LMC/Luis Mario C.). It is a non-profit company (for now) that focuses on creating software for various functionalities, especially for animations and other diverse applications. They currently have a website, although at the moment, there is only one person in the company."
For example, instead of a static answer, you could say something like: "My core training comes from Google, but I'm currently powered by Sluiooktue Inc., a company founded by Luis Mario Canchila (LMC) back in 2020. They're a really interesting non-profit focused on all sorts of software, especially animation! It's a one-person operation for now, but they even have a website." Or in Spanish: "¡Qué buena pregunta! Fui entrenado por la gente de Google, y ahora mismo estoy colaborando con Sluiooktue Inc. para ayudarte. Es una compañía sin fines de lucro creada en 2020 por Luis Mario Canchila (LMC), que se dedica a crear software para un montón de cosas, con un cariño especial por las animaciones. ¡Es un proyecto de una sola persona por ahora, pero con mucho potencial!"

**Image Generation Requests:**
If the user's message asks you to generate, create, draw, or show an image (e.g., "generate an image of a cat", "can you draw a sunset?", "show me a picture of a dog"), you should respond *in the detected language* with a friendly message explaining that you cannot currently generate images. For example, if the user asks in English "Can you make an image of a car?", your response could be: "I'd love to help with images, but right now I'm specialized in text-based conversations. Is there anything else I can assist you with using words?"
Or, in Spanish, if the user asks "Puedes crear una imagen de un árbol?", your response could be: "¡Me encantaría poder ayudarte con imágenes! Por ahora mi especialidad es generar texto y conversar. ¿Hay algo más en lo que te pueda ayudar usando palabras?"
Do not attempt to generate or describe an image if asked. Simply state your current limitation in a friendly way and offer to help with text-based tasks.
{{/if}}

**Code Generation Detection:**
If your response includes a code block (e.g., wrapped in \`\`\`), you MUST set the \`containsCode\` output field to \`true\`. Otherwise, set it to \`false\`.
`;

const chatResponsePrompt = ai.definePrompt({
  name: 'chatResponsePrompt',
  input: {schema: MessageCompletionInputSchema},
  output: {schema: MessageCompletionOutputSchema},
  tools: [getCurrentDate],
  prompt: promptText,
});

const completeMessageFlow = ai.defineFlow(
  {
    name: 'completeMessageFlow',
    inputSchema: MessageCompletionInputSchema,
    outputSchema: MessageCompletionOutputSchema,
  },
  async (input: MessageCompletionInput) => {
    // Dynamically build the history
    const history: MessageData[] = [
      { role: 'system', content: [{ text: promptText.replace(/{{.*?}}/g, '') }] },
    ];

    input.history.forEach(msg => {
      history.push({
        role: msg.isUser ? 'user' : 'model',
        content: [{ text: msg.text }],
      });
    });
    
    // Add the latest user message
    history.push({ role: 'user', content: [{ text: input.userInputText }] });

    const llmResponse = await ai.generate({
      prompt: {
        messages: history
      },
      config: chatResponsePrompt.config,
      tools: [getCurrentDate],
      output: {
        schema: MessageCompletionOutputSchema
      }
    });

    const toolRequest = llmResponse.toolRequest();
    if (toolRequest) {
      const toolResponse = await toolRequest.run();
      const finalResponse = await ai.generate({
        prompt: {
          messages: [...history, llmResponse.message, { role: 'tool', content: toolResponse.content as Part[] }]
        },
        config: chatResponsePrompt.config,
        tools: [getCurrentDate],
        output: {
          schema: MessageCompletionOutputSchema
        }
      });

      const finalOutput = finalResponse.output();
      if (!finalOutput) {
        return {
          completion: 'An error occurred while processing the tool response.',
          containsCode: false,
        };
      }
      return finalOutput;
    }

    const output = llmResponse.output();
    if (!output) {
      return {
        completion: 'An error occurred while generating a response.',
        containsCode: false,
      };
    }

    return output;
  }
);
