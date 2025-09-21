'use server';

/**
 * @fileOverview An AI agent that generates unique Habbo-style usernames.
 *
 * - generateHabboName - A function that handles the name generation process.
 * - GenerateHabboNameInput - The input type for the generateHabboName function.
 * - GenerateHabboNameOutput - The return type for the generateHabboName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHabboNameInputSchema = z.object({
  keyword: z.string().describe('A keyword or theme to base the usernames on. E.g., "pixel", "cool", "rare".'),
});
export type GenerateHabboNameInput = z.infer<typeof GenerateHabboNameInputSchema>;

const GenerateHabboNameOutputSchema = z.object({
  names: z.array(z.string()).describe('A list of 5-10 generated Habbo-style usernames.'),
});
export type GenerateHabboNameOutput = z.infer<typeof GenerateHabboNameOutputSchema>;

export async function generateHabboName(input: GenerateHabboNameInput): Promise<GenerateHabboNameOutput> {
  return generateHabboNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHabboNamePrompt',
  input: {schema: GenerateHabboNameInputSchema},
  output: {schema: GenerateHabboNameOutputSchema},
  prompt: `You are a creative assistant for the Habbo Hotel game. Your task is to generate a list of unique, fun, and available-sounding usernames based on a user's keyword.

  Follow these rules for the usernames:
  - They should be catchy and memorable.
  - They can include hyphens (-), dots (.), or underscores (_), but not at the beginning or end.
  - They often mix words, numbers, and symbols. Examples: -lRon, lRon, DJ-Pixel, lRon.l, __--Ron--__
  - Generate between 5 and 10 names.
  - Do not use inappropriate language.
  
  The user's keyword is: {{{keyword}}}
  
  Generate a list of usernames.`,
});

const generateHabboNameFlow = ai.defineFlow(
  {
    name: 'generateHabboNameFlow',
    inputSchema: GenerateHabboNameInputSchema,
    outputSchema: GenerateHabboNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
