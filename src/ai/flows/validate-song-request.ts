'use server';

/**
 * @fileOverview This file defines a Genkit flow for validating song requests.
 * 
 * - validateSongRequest - A function that validates a song request using an LLM.
 * - ValidateSongRequestInput - The input type for the validateSongRequest function.
 * - ValidateSongRequestOutput - The return type for the validateSongRequest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateSongRequestInputSchema = z.object({
  songRequest: z
    .string()    
    .describe('The song request submitted by the user.'),
});
export type ValidateSongRequestInput = z.infer<typeof ValidateSongRequestInputSchema>;

const ValidateSongRequestOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the song request is valid or not.'),
  reason: z.string().describe('The reason for the song request being invalid, if applicable.'),
});
export type ValidateSongRequestOutput = z.infer<typeof ValidateSongRequestOutputSchema>;

export async function validateSongRequest(input: ValidateSongRequestInput): Promise<ValidateSongRequestOutput> {
  return validateSongRequestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateSongRequestPrompt',
  input: {schema: ValidateSongRequestInputSchema},
  output: {schema: ValidateSongRequestOutputSchema},
  prompt: `You are a radio station manager who is responsible for validating song requests.

You will be given a song request and you must determine if it is appropriate for the radio station.

Consider the following factors:

- Is the song request relevant to the radio station's theme?
- Is the song request appropriate for all audiences?
- Is the song request free of any offensive or explicit content?

If the song request is valid, return isValid as true. If the song request is invalid, return isValid as false and provide a reason in the reason field.

Song Request: {{{songRequest}}}`,
});

const validateSongRequestFlow = ai.defineFlow(
  {
    name: 'validateSongRequestFlow',
    inputSchema: ValidateSongRequestInputSchema,
    outputSchema: ValidateSongRequestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
