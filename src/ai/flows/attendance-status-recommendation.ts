
// src/ai/flows/attendance-status-recommendation.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing employee attendance data and recommending status changes.
 *
 * The flow takes employee attendance data as input and uses an AI model to suggest changes to the attendance status (e.g., from 'Present' to 'Late').
 * It exports the following:
 * - `attendanceStatusRecommendation`: The main function to trigger the flow.
 * - `AttendanceStatusRecommendationInput`: The input type for the `attendanceStatusRecommendation` function.
 * - `AttendanceStatusRecommendationOutput`: The output type for the `attendanceStatusRecommendation` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  AnalyzeAttendanceAndSuggestChangesInput,
  AnalyzeAttendanceAndSuggestChangesOutput,
} from './analyze-attendance-and-suggest-changes';

const AttendanceStatusRecommendationInputSchema = z.object({
  employeeId: z.string().describe('The ID of the employee to analyze.'),
  attendanceRecords: z
    .array(
      z.object({
        date: z
          .string()
          .describe('The date of the attendance record (ISO format).'),
        arrivalTime: z
          .string()
          .describe('The arrival time of the employee (HH:mm).'),
        expectedArrivalTime: z
          .string()
          .describe('The expected arrival time of the employee (HH:mm).'),
        status: z
          .enum(['Present', 'Late', 'Absent'])
          .describe('The current attendance status.'),
      })
    )
    .describe('An array of attendance records for the employee.'),
  gracePeriodMinutes: z
    .number()
    .describe('The grace period in minutes after the expected arrival time.'),
});
export type AttendanceStatusRecommendationInput = z.infer<
  typeof AttendanceStatusRecommendationInputSchema
>;

const AttendanceStatusRecommendationOutputSchema = z.object({
  recommendations: z
    .array(
      z.object({
        date: z
          .string()
          .describe(
            'The date of the attendance record for the recommendation (ISO format).'
          ),
        suggestedStatus: z
          .enum(['Present', 'Late', 'Absent'])
          .describe('The suggested attendance status.'),
        reason: z
          .string()
          .describe('The reason for the suggested status change.'),
      })
    )
    .describe('An array of recommendations for attendance status changes.'),
});
export type AttendanceStatusRecommendationOutput = z.infer<
  typeof AttendanceStatusRecommendationOutputSchema
>;
export type {
  AnalyzeAttendanceAndSuggestChangesInput,
  AnalyzeAttendanceAndSuggestChangesOutput,
};

export async function attendanceStatusRecommendation(
  input: AttendanceStatusRecommendationInput
): Promise<AttendanceStatusRecommendationOutput> {
  return attendanceStatusRecommendationFlow(input);
}

const attendanceStatusRecommendationPrompt = ai.definePrompt({
  name: 'attendanceStatusRecommendationPrompt',
  input: {schema: AttendanceStatusRecommendationInputSchema},
  output: {schema: AttendanceStatusRecommendationOutputSchema},
  prompt: `You are an AI assistant that analyzes employee attendance records and suggests status changes based on their arrival times and a defined grace period.

  Analyze the following attendance records for employee ID {{{employeeId}}}. The grace period is {{{gracePeriodMinutes}}} minutes.

  {{#each attendanceRecords}}
  - Date: {{{date}}}, Arrival Time: {{{arrivalTime}}}, Expected Arrival Time: {{{expectedArrivalTime}}}, Status: {{{status}}}
  {{/each}}

  Consider these factors:
  - Consistently arriving just after the grace period should result in a 'Late' recommendation.
  - If the employee is marked as 'Present' but arrives significantly late, suggest a change to 'Late'.
  - If the employee is marked as 'Present' and arrives before the grace period, do not suggest a change.
  - The date format is YYYY-MM-DD and time format is HH:mm.
  - Only output the suggested changes.

  Return the recommendations in the following JSON format:
  {
    "recommendations": [
      {
        "date": "YYYY-MM-DD",
        "suggestedStatus": "Present | Late | Absent",
        "reason": "Explanation for the suggested change"
      }
    ]
  }
  `,
});

const attendanceStatusRecommendationFlow = ai.defineFlow(
  {
    name: 'attendanceStatusRecommendationFlow',
    inputSchema: AttendanceStatusRecommendationInputSchema,
    outputSchema: AttendanceStatusRecommendationOutputSchema,
  },
  async (input) => {
    const {output} = await attendanceStatusRecommendationPrompt(input);
    return output!;
  }
);
