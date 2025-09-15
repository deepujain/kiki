// src/ai/flows/analyze-attendance-records.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing employee attendance records and flagging employees for potential status changes to 'late'.
 *
 * The flow takes employee attendance data as input, considers historical patterns, and suggests status changes to 'Late' when appropriate.
 * It exports the following:
 * - `analyzeAttendanceRecords`: The main function to trigger the flow.
 * - `AnalyzeAttendanceRecordsInput`: The input type for the `analyzeAttendanceRecords` function.
 * - `AnalyzeAttendanceRecordsOutput`: The output type for the `analyzeAttendanceRecords` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAttendanceRecordsInputSchema = z.object({
  employeeId: z.string().describe('The ID of the employee to analyze.'),
  attendanceRecords: z.array(
    z.object({
      date: z.string().describe('The date of the attendance record (ISO format).'),
      arrivalTime: z.string().describe('The arrival time of the employee (HH:mm).'),
      expectedArrivalTime: z.string().describe('The expected arrival time of the employee (HH:mm).'),
      status: z.enum(['Present', 'Late', 'Absent']).describe('The current attendance status.'),
    })
  ).describe('An array of attendance records for the employee.'),
  gracePeriodMinutes: z.number().describe('The grace period in minutes after the expected arrival time.'),
  arrivalThresholdMinutes: z.number().describe('The threshold in minutes after the expected arrival time to flag an employee as potentially late.'),
});
export type AnalyzeAttendanceRecordsInput = z.infer<typeof AnalyzeAttendanceRecordsInputSchema>;

const AnalyzeAttendanceRecordsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      date: z.string().describe('The date of the attendance record for the recommendation (ISO format).'),
      suggestedStatus: z.enum(['Present', 'Late', 'Absent']).describe('The suggested attendance status, should be late if the employee arrived after the threshold.'),
      reason: z.string().describe('The reason for the suggested status change.'),
    })
  ).describe('An array of recommendations for attendance status changes to Late.'),
});
export type AnalyzeAttendanceRecordsOutput = z.infer<typeof AnalyzeAttendanceRecordsOutputSchema>;

export async function analyzeAttendanceRecords(input: AnalyzeAttendanceRecordsInput): Promise<AnalyzeAttendanceRecordsOutput> {
  return analyzeAttendanceRecordsFlow(input);
}

const analyzeAttendanceRecordsPrompt = ai.definePrompt({
  name: 'analyzeAttendanceRecordsPrompt',
  input: {schema: AnalyzeAttendanceRecordsInputSchema},
  output: {schema: AnalyzeAttendanceRecordsOutputSchema},
  prompt: `You are an AI assistant that analyzes employee attendance records and suggests status changes to "Late" if the employee's arrival time exceeds a defined threshold after the expected arrival time, taking into account a grace period. Base your decision on historical patterns.

  Analyze the following attendance records for employee ID {{{employeeId}}}. The grace period is {{{gracePeriodMinutes}}} minutes, and the arrival threshold is {{{arrivalThresholdMinutes}}} minutes.

  {{#each attendanceRecords}}
  - Date: {{{date}}}, Arrival Time: {{{arrivalTime}}}, Expected Arrival Time: {{{expectedArrivalTime}}}, Status: {{{status}}}
  {{/each}}

  Consider these factors:
  - Only suggest a change to "Late" if the employee's arrival time is later than the expected arrival time plus the grace period plus the arrival threshold, and there is a historical pattern of lateness.
  - Do not suggest changes for attendance records where the current status is already "Late" or "Absent".
  - The date format is YYYY-MM-DD and time format is HH:mm.

  Return the recommendations in the following JSON format. Only output the records for which a change is recommended:
  {
    "recommendations": [
      {
        "date": "YYYY-MM-DD",
        "suggestedStatus": "Late",
        "reason": "Explanation for the suggested change to Late" // The reason should mention the number of minutes the arrival time exceeded the acceptable limit and the historical pattern of lateness.
      }
    ]
  }
  `,
});

const analyzeAttendanceRecordsFlow = ai.defineFlow(
  {
    name: 'analyzeAttendanceRecordsFlow',
    inputSchema: AnalyzeAttendanceRecordsInputSchema,
    outputSchema: AnalyzeAttendanceRecordsOutputSchema,
  },
  async input => {
    const {output} = await analyzeAttendanceRecordsPrompt(input);
    return output!;
  }
);
