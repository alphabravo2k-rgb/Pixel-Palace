import { z } from 'zod';

/**
 * 🛡️ VALIDATOR SERVICE: DATA INTEGRITY SHIELD
 * VERSION: 2050.5.0
 * STATUS: ACTIVE
 */

// 1. REGISTRATION SCHEMA
export const RegisterSchema = z.object({
  email: z.string().email({ message: "Invalid email format." }),
  password: z.string().min(8, { message: "Password must be at least 8 chars." }),
  username: z.string()
    .min(3, { message: "Username too short." })
    .max(20, { message: "Username too long." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Only letters, numbers, and underscores." }),
  faceit_nickname: z.string().optional()
});

// 2. TEAM CREATION SCHEMA
export const TeamSchema = z.object({
  name: z.string()
    .min(3, { message: "Team Name is required." })
    .max(30, { message: "Team Name is too long." }),
  short_name: z.string()
    .max(5, { message: "Tag must be 5 chars or less (e.g. NAVI)." })
    .toUpperCase(),
  logo_url: z.string().url().optional().or(z.literal(''))
});

// 3. MATCH RESULT SCHEMA
export const MatchResultSchema = z.object({
  score_team1: z.number().min(0).max(30),
  score_team2: z.number().min(0).max(30),
  winner_id: z.string().uuid({ message: "Invalid Winner ID." }),
  demo_url: z.string().url().optional()
});

/**
 * 🛠️ HELPER: Validate & Parse
 * Returns { success: true, data } or { success: false, errors }
 */
export const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    // Format Zod errors into a simple string array
    const errors = result.error.errors.map(e => e.message).join(", ");
    return { success: false, error: errors };
  }
};
