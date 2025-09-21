'use server';

/**
 * @fileOverview An AI agent that fetches the latest news about the radio station.
 *
 * - fetchLatestNews - A function that fetches the latest news about the radio station.
 * - FetchLatestNewsInput - The input type for the fetchLatestNews function.
 * - FetchLatestNewsOutput - The return type for the fetchLatestNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FetchLatestNewsInputSchema = z.object({
  stationName: z.string().describe('The name of the radio station.'),
});
export type FetchLatestNewsInput = z.infer<typeof FetchLatestNewsInputSchema>;

const FetchLatestNewsOutputSchema = z.object({
  newsSummary: z.string().describe('A summary of the latest news about the radio station.'),
});
export type FetchLatestNewsOutput = z.infer<typeof FetchLatestNewsOutputSchema>;

export async function fetchLatestNews(input: FetchLatestNewsInput): Promise<FetchLatestNewsOutput> {
  return fetchLatestNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fetchLatestNewsPrompt',
  input: {schema: FetchLatestNewsInputSchema},
  output: {schema: FetchLatestNewsOutputSchema},
  prompt: `You are an AI assistant tasked with fetching the latest news about a radio station.

  Summarize the latest news about {{stationName}}.\n`,
});

const fetchLatestNewsFlow = ai.defineFlow(
  {
    name: 'fetchLatestNewsFlow',
    inputSchema: FetchLatestNewsInputSchema,
    outputSchema: FetchLatestNewsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
