import { z } from "zod";
import { isValidTtPhone } from "./tt-phone";

export const registrationSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(200),
  nationalId: z.string().min(1, "National ID is required").max(50),
  dateOfBirth: z.string().min(1, "Date of birth is required").max(20),
  address: z.string().min(1, "Address is required").max(500),
  phoneNumber: z.string().refine(isValidTtPhone, "Enter a valid TT phone number, e.g. (868) 123-4567"),
  email: z.string().email("Invalid email address").max(200).optional().nullable(),
  productCategory: z.string().max(200).optional().nullable(),
  productCategoryNote: z.string().max(500).optional().nullable(),
  consent: z.boolean().refine((v) => v === true, "Consent is required"),
}).superRefine((data, ctx) => {
  if (data.productCategory === "other" && !(data.productCategoryNote ?? "").trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["productCategoryNote"],
      message: "Describe what else you need",
    });
  }
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const searchSchema = z.object({
  query: z.string().min(1, "Query is required").max(200),
});

export type SearchInput = z.infer<typeof searchSchema>;

/** Redeem a registrant's hamper on event day. */
export const redeemSchema = z.object({
  registrantId: z.string().uuid(),
});

export type RedeemInput = z.infer<typeof redeemSchema>;
