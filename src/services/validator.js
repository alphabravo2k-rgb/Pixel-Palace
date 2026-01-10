/**
 * 🛡️ VALIDATOR SERVICE: DATA INTEGRITY SHIELD
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: ACTIVE // ZOD ENFORCED
 */

import { z } from 'zod';

// 1. REGISTRATION SCHEMA (The Entry Gate)
export const RegisterSchema = z.object({
  email: z.string().email({ message: "Neural Link requires a valid email." }),
  password: z.string()
    .min(8, { message: "Security protocol: 8+ characters required." })
    .regex(/[A-Z]/, { message: "Include at least one uppercase letter." })
    .regex(/[0-9]/, { message: "Include at least one numeric digit." }),
  username: z.string()
    .min(3, { message: "Handle too short for registration." })
    .max(16, { message: "Handle exceeds character limit." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Alphanumeric and underscores only." }),
  faceit_nickname: z.string().optional()
});

// 2. TEAM CREATION SCHEMA (Industrial Standards)
export const TeamSchema = z.object({
  name: z.string()
    .min(3, { message: "Team Name required." })
    .max(24, { message: "Team Name exceeds operational length." }),
  short_name: z.string()
    .min(2, { message: "Tag must be 2-5 chars." })
    .max(5, { message: "Tag exceeds 5 chars." })
    .toUpperCase(),
  logo_url: z.string().url().optional().or(z.literal(''))
});

// 3. MATCH RESULT SCHEMA (Competitive Integrity)
export const MatchResultSchema = z.object({
  score_team1: z.number().int().min(0).max(48), // Extended for Triple Overtime
  score_team2: z.number().int().min(0).max(48),
  winner_id: z.string().uuid({ message: "Invalid Signature for Winner ID." }),
  demo_url: z.string().url().optional().or(z.literal(''))
});

/**
 * 🛠️ VALIDATION KERNEL
 * Gracefully parses data and returns a tactical error report.
 * @param {z.ZodSchema} schema 
 * @param {object} data 
 */
export const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    // Transform complex Zod errors into a scannable string
    const errorMessage = result.error.errors
      .map(e => e.message)
      .join(" | ");
    
    return { success: false, error: errorMessage };
  }
};
