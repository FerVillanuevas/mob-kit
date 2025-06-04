import { z } from "zod";

export const CustomerSchema = z.object({
  customerId: z.string().optional(),
  customerNo: z.string().optional(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  secondName: z.string().optional(),
  password: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  login: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters"),
  enabled: z.boolean().default(true),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  phoneHome: z.string().optional(),
  phoneMobile: z
    .string()
    .regex(/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  phoneBusiness: z.string().optional(),
  fax: z.string().optional(),
  preferredLocale: z.string().optional(),
  gender: z.enum(["0", "1", "2"]).optional(),
  salutation: z.enum(["Mr.", "Mrs.", "Ms.", "Dr."]).optional(),
  title: z.string().optional(),
  suffix: z.string().optional(),
  birthday: z.date().optional(),
  note: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

export type CustomerFormData = z.infer<typeof CustomerSchema>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string(),
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;
