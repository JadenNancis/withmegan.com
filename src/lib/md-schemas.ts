import { z } from "zod";
import { isValidTtPhone } from "./tt-phone";

export const registrationSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(200),
  nationalId: z.string().max(50).optional().nullable(),
  dateOfBirth: z.string().min(1, "Date of birth is required").max(20),
  address: z.string().min(1, "Address is required").max(500),
  phoneNumber: z.string().refine(isValidTtPhone, "Enter a valid TT phone number, e.g. (868) 123-4567"),
  email: z.string().email("Invalid email address").max(200).optional().nullable(),
  productCategory: z.string().max(200).optional().nullable(),
  householdReference: z.string().max(50).optional().nullable(),
  consent: z.boolean().refine((v) => v === true, "Consent is required"),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const createHouseholdSchema = z.object({
  reference: z.string().max(50).optional(),
  hamperStatus: z.enum(["unassigned", "assigned", "redeemed"]).optional(),
});

export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>;

export const assignRegistrantSchema = z.object({
  registrantId: z.string().uuid(),
  householdId: z.string().uuid(),
});

export type AssignRegistrantInput = z.infer<typeof assignRegistrantSchema>;

export const updateHamperStatusSchema = z.object({
  householdId: z.string().uuid(),
  hamperStatus: z.enum(["unassigned", "assigned", "redeemed"]),
});

export type UpdateHamperStatusInput = z.infer<typeof updateHamperStatusSchema>;

export const searchSchema = z.object({
  query: z.string().min(1, "Query is required").max(200),
});

export type SearchInput = z.infer<typeof searchSchema>;

export const redeemSchema = z.object({
  householdId: z.string().uuid(),
});

export type RedeemInput = z.infer<typeof redeemSchema>;