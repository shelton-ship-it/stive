import { z } from "zod";
export const UserSchema = z.object({ id: z.string(), email: z.string().email() });
export type User = z.infer<typeof UserSchema>;
export const PlanSchema = z.enum(["free", "lite", "pro", "team"]);
export type Plan = z.infer<typeof PlanSchema>;
